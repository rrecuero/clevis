const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')

let copyRecursiveSync = function(src, dest) {
  var exists = fs.existsSync(src);
  var stats = exists && fs.statSync(src);
  var isDirectory = exists && stats.isDirectory();
  if (exists && isDirectory) {
    fs.mkdirSync(dest);
    fs.readdirSync(src).forEach(function(childItemName) {
      copyRecursiveSync(path.join(src, childItemName),
                        path.join(dest, childItemName));
    });
  } else {
    //fs.copySync(src, dest);
    fs.createReadStream(src).pipe(fs.createWriteStream(dest));
  }
};

module.exports = async (params)=>{

  console.log("Creating react app...")

  let craResult = await cra(true);
  console.log(craResult)


  let ignore = params.fs.readFileSync(__dirname+"/../templates/gitignore").toString()
  if(!params.fs.existsSync(".gitignore")) {
    console.log("Adding .gitignore")
    params.fs.writeFileSync(".gitignore",ignore);
  }

  console.log("Creating config file: clevis.json")
  let init = params.fs.readFileSync(__dirname+"/../templates/config.json").toString()
  params.fs.writeFileSync("clevis.json",init);

  params.fs.writeFileSync("run.sh","#!/bin/bash\ndocker run -ti --rm --name clevis -p 3000:3000 -p 8545:8545 -v ${PWD}:/dapp austingriffith/clevis\n");
  params.fs.writeFileSync("attach.sh","#!/bin/bash\ndocker exec -ti clevis bash\n");
  params.fs.writeFileSync("stop.sh","#!/bin/bash\ndocker stop clevis\n");

  //installing node module locally//
  console.log("Installing clevis (this will take a while to compile)...")

  exec('chmod +x *.sh;npm install --save clevis@latest;npm install --save s3;npm install --g mocha;git clone https://github.com/OpenZeppelin/openzeppelin-solidity.git;cd openzeppelin-solidity git pull', (err, stdout, stderr) => {
    exec('clevis update', (err, stdout, stderr) => {}).stdout.on('data', function(data) {
        console.log(data)
    })
  }).stdout.on('data', function(data) {
      console.log(data);
  })/*.stderr.on('data', function(data) {
      console.log(data);
  });*/

  console.log("Syncing default tests...")
  if(!fs.existsSync("tests")){
    copyRecursiveSync(__dirname+"/../templates/tests","tests")
  }

  console.log("Touching contract list...")
  if(!fs.existsSync("contracts.clevis")){
    fs.writeFileSync("contracts.clevis","")
  }

  return "Updating Clevis, S3, Mocha, OpenZeppelin, and current gas/eth prices..."
}

function cra(DEBUG) {
  return new Promise((resolve, reject) => {
    if(fs.existsSync("./src")){
      resolve("Skipping CRA, src exists...")
    }else{
      console.log("Installing specific version of CRA...")
      let reactAction = exec('npx create-react-app .;npm i;rm -rf src;npm install --save dapparatus;npm i mocha;sudo npm link mocha;', (err, stdout, stderr) => {
        if (err) {
          // node couldn't execute the command
          reject(err);
          return;
        }
        copyRecursiveSync(__dirname+"/../templates/src","src")
        resolve(`${stdout}`);
      })
      reactAction.stdout.on('data', function(data) {
          console.log(data);
      });
      reactAction.stderr.on('data', function(data) {
          console.log(data);
      });
    }


  })
}
