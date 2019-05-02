const fs = require('fs');
const path = require('path');

const deleteFile = (filePath) => {
    if(filePath){
        fs.unlink( path.join(__dirname, '..', filePath), (err) => {
            if(err){
                throw (err);
            }
        });
    }
};

exports.deleteFile = deleteFile;