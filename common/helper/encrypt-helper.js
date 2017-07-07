var key = 'gqDkv4stsxhULtU5';

var encryptor = require('simple-encryptor')(key);

module.exports.encryptHelper = {
    encrypt: function(plainText) {
        var encrypted = encryptor.encrypt(plainText);
        return encrypted;
    },
    decrypt: function(encryptedText) {
        var decrypted = encryptor.decrypt(encryptedText);
        return decrypted;
    }
};