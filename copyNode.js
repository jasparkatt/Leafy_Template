const copyNodeModule = require('copy-node-modules');
const srcDir = './';
const dstDir = './dist';



copyNodeModule(srcDir, dstDir, {devDependencies: false}, function(err, results){
    if (err) {
        console.error(err);
        return;
    }
    for (var i in results) {
        console.log('package name:' + results[i].name + ' version:' + results[i].version);
    }
});
