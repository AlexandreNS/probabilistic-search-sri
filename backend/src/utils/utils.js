const Utils = {};
Utils.writeFile = (content,pathTitle,fs) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(pathTitle, content, 'utf8', function (err) {
      if (err) {
        console.log(err);
        return reject(err);
      }
      return resolve();
    });
  })
};

module.exports = Utils;