
function trie() {
    var o = new Object;
    o.words = 0;
    o.children = {};
    return o;
};

function obj_insert(obj, str, pos) {
    if(str.length == 0) { //blank string cannot be inserted
        return;
    }
    
    var T = obj;
        
    if(pos === undefined) {
        pos = 0;
    }
    if(pos === str.length) {
        T.words ++;
        return;
    }
    /*T.prefixes ++;*/
    k = str[pos];
    if(T.children[k] === undefined) { //if node for this char doesn't exist, create one
        T.children[k] = trie();
    }
    child = T.children[k];
    obj_insert(child, str, pos + 1);
}