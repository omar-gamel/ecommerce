const fs = require('fs');

const deleteFile = (filePath) => {
    if(filePath){
        fs.unlink(filePath, (err) => {
            if(err){
                throw (err);
            }
        });
    }
};

exports.deleteFile = deleteFile;