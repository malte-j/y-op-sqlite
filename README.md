<p align="center"> 
  <img  src="https://cdn.malts.me/6Wu0Fj.svg" />
</p>


## Installing

You can install y-op-sqlite and its peer dependencies using expo:

```sh
# install using expo
npx expo install y-op-sqlite yjs @op-engineering/op-sqlite
```

Or alternatively using npm:

```sh
# install using npm
npm i y-op-sqlite yjs @op-engineering/op-sqlite
```

Make sure to check the [op-sqlite docs](https://ospfranco.notion.site/Installation-93044890aa3d4d14b6c525ba4ba8686f) for instructions on setting up op-sqlite in your React Native project.

## Usage


```ts
import { OPSQLitePersistence } from 'y-op-sqlite';

// other code...

const provider = new OPSQLitePersistence(docName, ydoc)

provider.whenSynced.then(() => {
  console.log("content finished loading from database.");
});
```

When you're done accessing the document, you can destroy the connection to the provider:

```ts
// stop syncing with database
provider.destroy();
```


## Attribution

This library is based on [y-indexdb](https://github.com/yjs/y-indexeddb) by Kevin Jahns.
Thanks to [@ospfranco](https://github.com/ospfranco) for creating op-sqlite.
