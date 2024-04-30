import * as Y from "yjs";
import * as promise from "lib0/promise";
import { ObservableV2 } from "lib0/observable";
import { open, OPSQLiteConnection } from "@op-engineering/op-sqlite";

export const PREFERRED_TRIM_SIZE = 500;

const DB_PREFIX = "opssqlite-persistence-";

export class OPSQLitePersistence extends ObservableV2<{
  synced: (persistence: OPSQLitePersistence) => void;
}> {
  doc: Y.Doc;
  name: string;
  whenSynced: Promise<this>;
  db: OPSQLiteConnection;
  synced: boolean = false;
  _dbref = 0;
  _dbsize = 0;
  _destroyed = false;

  constructor(name: string, doc: Y.Doc) {
    super();
    this.doc = doc;
    this.name = name;

    this.whenSynced = promise.create((resolve) =>
      this.on("synced", () => resolve(this))
    );

    this.db = open({ name: DB_PREFIX + name + ".sqlite" });
    this.db
      .executeAsync(
        "CREATE TABLE IF NOT EXISTS updates (id INTEGER PRIMARY KEY, content BLOB)"
      )
      .then(() => {
        const s = Y.encodeStateAsUpdate(doc);
        if (s.length > 0) {
          this._storeUpdate(s, null);
        }
      })
      .then(() =>
        this.db
          .executeAsync("SELECT content FROM updates")
          .catch((e) => console.error("error loading updates", e))
      )
      .then((res) => {
        if (res != undefined && res.rows != undefined) {
          for (const row of res.rows._array) {
            Y.applyUpdate(doc, new Uint8Array(row.content));
          }
        }

        this.synced = true;
        this.emit("synced", [this]);
      });

    this.destroy = this.destroy.bind(this);
    this._storeUpdate.bind(this);
    doc.on("update", this._storeUpdate.bind(this));
    doc.on("destroy", this.destroy.bind(this));
  }
  _storeUpdate(update: Uint8Array, origin: any) {
    if (!this.db || origin == this) {
      !this.db && console.error("trying to store update without db");
      return;
    }

    return this.db
      .executeAsync(`INSERT INTO updates (content) VALUES (?)`, [update])
      .catch((e) => console.error("error storing update", e));
  }

  destroy() {
    this.doc.off("update", this._storeUpdate);
    this.doc.off("destroy", this.destroy);
    this._destroyed = true;
    return this.db.close();
  }
}
