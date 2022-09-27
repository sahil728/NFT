const Models = require("../Models");

var generateNFt = async function (collection,layersOrder,edition) {
    // importing modules
    const fs = require("fs");
    const { createCanvas, loadImage } = require("canvas");
  
    // initalizing constants
    const canvas = createCanvas(collection.format.width,collection.format.height);
    const metDataFile = '_metadata.json';
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = !!collection.format.smoothing;
    
    let layersDir = `${process.cwd()}/${collection.path}/Layers`;
    let buildDir = `${process.cwd()}/${collection.path}/build`;
    let metadata = [];
    let attributes = [];
    let hash = [];
    let decodedHash = [];
    const Exists = new Map();
    let occurence = {};
  
    // initalizing functions
    const getElements = (path, total) => {
      return fs
        .readdirSync(path)
        .filter((item) => !/(^|\/)\.[^\/\.]/g.test(item))
        .map((i, index) => {
          return {
            id: index + 1,
            name: cleanName(i),
            fileName: i,
            rarity: addRarity(i, total),
          };
        });
    };
  
    const addRarity = (_str, total) => {
      let itemRarity;
      let name = _str.slice(0, -4);
      if (name.includes('_')) {
        itemRarity = Number(name.split("_")[1]);
      }
      else {
        itemRarity = Number((edition / total)/edition)*100;
      }
      return itemRarity;
    };
  
    const cleanName = (_str) => {
      let name = _str.slice(0, -4).split('_')[0];
      return name;
    };
  
    const saveLayer = async(_canvas, _edition) => {
      fs.writeFileSync(`${buildDir}/images/${_edition}.png`, _canvas.toBuffer("image/png"));
    };
  
    const addMetadata = (_edition) => {
      let dateTime = Date.now();
      let tempMetadata = {
        hash: hash.join(""),
        decodedHash: decodedHash,
        edition: _edition,
        date: dateTime,
        attributes: attributes,
      };
      metadata.push(tempMetadata);
      attributes = [];
      hash = [];
      decodedHash = [];
    };
  
    const addAttributes = (_element, _layer) => {
      let tempAttr = {
        id: _element.id,
        layer: _layer.name,
        name: _element.name,
        rarity: _element.rarity,
      };
      attributes.push(tempAttr);
      hash.push(_layer.id);
      hash.push(_element.id);
      decodedHash.push({ [_layer.id]: _element.id });
    };
  
    const drawLayer = async (_layer, _edition) => {
      let draw = true;
      do {
        const rand = Math.random();
        let element = _layer.elements[Math.floor(rand * _layer.number)] ? _layer.elements[Math.floor(rand * _layer.number)] : null;
        if (element) {
          let total_occurence = (element.rarity*edition)/100;
          let count = occurence[_layer.name].filter((val) => val == element.id).length;
          if (count < total_occurence) {
            occurence[_layer.name].push(element.id);
            addAttributes(element, _layer);
            const image = await loadImage(`${_layer.location}${element.fileName}`);
  
            ctx.drawImage(
              image,
              _layer.position.x,
              _layer.position.y,
              _layer.size.width,
              _layer.size.height
            );
            saveLayer(canvas, _edition);
            draw = false;
          }
        }
      } while (draw);
    };
    const saveMetaData = async(_edition) => {
      let data = metadata.find((meta) => meta.edition == _edition);
      fs.writeFileSync(`${buildDir}/json/${_edition}.json`,
        JSON.stringify(data, null, 2)
      );
    };
  
    const createNft = async(_edition) => {
      const [a, ...imageUrl] = collection.path.split('/');
      await Models.Nts.create({
        collectionId:collection._id,
        imagePath:`${collection.path}/build/images/${_edition}.png`,
        jsonPath:`${collection.path}/build/json/${_edition}.json`,
        imageUrl:`/Images/${imageUrl.join('/')}/build/images/${_edition}.png`
      });
    }
    // step 1 making build dir
    if (fs.existsSync(buildDir)) {
      fs.rmSync(buildDir, { recursive: true });
    }
    fs.mkdirSync(buildDir);
    fs.mkdirSync(`${buildDir}/json`);
    fs.mkdirSync(`${buildDir}/images`);
  
    // step 2 creating Nfts Files
    const layers = layersOrder.map((layerObj, index) => ({
      id: index,
      name: layerObj.name,
      location: `${layersDir}/${layerObj.name}/`,
      elements: getElements(`${layersDir}/${layerObj.name}/`, layerObj.number),
      position: { x: 0, y: 0 },
      size: { width:collection.format.width, height:collection.format.height },
      number: layerObj.number
    }));
  
    let numDupes = 0;
  
    layersOrder.forEach(({ name }) =>
      occurence[name] = []
    );
  
    for (let i = 1; i <= edition; i++) {
      await layers.forEach(async (layer) => {
        await drawLayer(layer, i);
      });
  
      let key = hash.toString();
      if (Exists.has(key)) {
        console.log(`Duplicate creation for edition ${i}. Same as edition ${Exists.get(key)}`);
        numDupes++;
        if (numDupes > edition) break; //prevents infinite loop if no more unique items can be created
        i--;
      } else {
        Exists.set(key, i);
        addMetadata(i);
        saveMetaData(i);
        // await createNft(i);
        console.log("Creating edition " + i);
      }
    }
  
    // step 3 creating metaData File
    fs.stat(`${buildDir}/${metDataFile}`, (err) => {
      if (err == null || err.code === 'ENOENT') {
        fs.writeFileSync(`${buildDir}/json/${metDataFile}`, JSON.stringify(metadata, null, 2));
      } else {
        console.log('Oh no, error: ', err.code);
      }
    });
};

module.exports = {
    generateNFt
}