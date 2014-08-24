

function obj_find(str) {
    if(str.length == 0) {
        return false;
    }
    
    if(obj_countword(masterlist, str) > 0) {
        return true;
    } else {
        return false;
    }
}

function obj_countword(obj, str, pos) {
    if(str.length == 0) {
        return 0;
    }
    var ret = 0;
    if(pos === undefined) {
        pos = 0;
    }   
    if(pos === str.length) {
        return obj.words;
    }
    k = str[pos];
    child = obj.children[k];
    if(child !== undefined) { //node exists
        ret = obj_countword(child, str, pos + 1);
    }
    return ret;
}


Trie = function() {
    this.words = 0;
    //this.prefixes = 0;
    this.children = [];
};

Trie.prototype = {
    
    
    //Insert a word into the dictionary. 
    
    insert: function(str, pos) {
        if(str.length == 0) { //blank string cannot be inserted
            return;
        }
        
        var T = this,
            k,
            child;
            
        if(pos === undefined) {
            pos = 0;
        }
        if(pos === str.length) {
            T.words ++;
            return;
        }
        //T.prefixes ++;
        k = str[pos];
        if(T.children[k] === undefined) { //if node for this char doesn't exist, create one
            T.children[k] = new Trie();
        }
        child = T.children[k];
        child.insert(str, pos + 1);
    },
    
    //Count the number of times a given word has been inserted into the dictionary
    
    countWord: function(str, pos) {
        if(str.length == 0) {
            return 0;
        }
        
        var T = this,
            k,
            child,
            ret = 0;
        
        if(pos === undefined) {
            pos = 0;
        }   
        if(pos === str.length) {
            return T.words;
        }
        k = str[pos];
        child = T.children[k];
        if(child !== undefined) { //node exists
            ret = child.countWord(str, pos + 1);
        }
        return ret;
    },
    
    
    //Find a word in the dictionary
    
    find: function(str) {
        if(str.length == 0) {
            return false;
        }
        
        if(this.countWord(str) > 0) {
            return true;
        } else {
            return false;
        }
    }
};