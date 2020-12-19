const { Datastore } = require('@google-cloud/datastore');

const datastore = new Datastore();
const configKey = datastore.key(['CatFeederConfig', 'config']);


async function doTest() {
    // let cfg = await datastore.get(configKey);
    datastore.get(configKey, (err, entity) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log(entity);
    })
    // console.log(cfg)
    await datastore.save({
        key: configKey,
        data: {
            frob: "frobless",
        }
    })
    console.log("returning")
}

doTest()
    .catch(console.error)
    .then(console.log)