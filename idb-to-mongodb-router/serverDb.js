globalCursorData = {
    callerRef: -1,
    valueList: -1,
    cursor: -1,
    target: {
        result: {
            value: -1
        }
    }
},
serverDB={};

serverDB.db={
		transaction:function(collectionType,mode){
            this.Transaction.collectionType = collectionType;
            this.Transaction.mode = mode;
            return this.Transaction;
		}
},
serverDB.db.Transaction={
	objectStore:function(collectionType){
   		this.ObjectStore.collectionType = collectionType;
        return this.ObjectStore;
    }
},
serverDB.db.Transaction.ObjectStore={
    put:function(a){
    	console.log('PUT called: '+this.collectionType+"->"+ JSON.stringify(a));
        var newResult = {};
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4){ 
               	if (xmlhttp.status == 200) {
                    newResult.onsuccess(xmlhttp.responseText);
                }else{
                    newResult.onfailure(xmlhttp.responseText);
                }
            }
        };
        xmlhttp.open("POST", "http/db/"+this.collectionType+"/" + "PUT", true);
        if(a == undefined || a == null)
        	xmlhttp.send();
        else
        	xmlhttp.send(JSON.stringify(a));
    	return newResult;
    },
    get:function(a){
    	console.log('GET called: '+this.collectionType+"->"+ JSON.stringify(a));
    	var newResult = {};
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4){ 
               	if (xmlhttp.status == 200) {
                    newResult.onsuccess({target:{result:JSON.parse(xmlhttp.responseText)}});
                }else{
                    newResult.onfailure(xmlhttp.responseText);
                }
            }
        };
        xmlhttp.open("POST", "http/db/"+this.collectionType+"/" + "GET?key="+a, true);
        if(a == undefined || a == null)
        	xmlhttp.send();
        else
        	xmlhttp.send(JSON.stringify(a));
    	return newResult;
    },
    index:function(a){
    	this.Index = {};
    	this.Index.indexOn = a;
    	this.Index.openCursor = function(openCursorOn){
    				var newResult = {};
    				var xmlhttp = new XMLHttpRequest();
    		        xmlhttp.onreadystatechange = function() {
    		            if (xmlhttp.readyState == 4){ 
    		               	if (xmlhttp.status == 200) {
                                   globalCursorData.valueList = JSON.parse(xmlhttp.responseText),
                               	   globalCursorData.cursor = 0;
                                   globalCursorData.target= {};
                                   if(globalCursorData.valueList.length>0){
                                	   globalCursorData.target.result={};
                                	   globalCursorData.target.result.value = globalCursorData.valueList[globalCursorData.cursor];
                                	   globalCursorData.callerRef = newResult;
                                       globalCursorData.target.result.continue = function(){
                                    	   globalCursorData.cursor=globalCursorData.cursor+1;
                                           if(globalCursorData.cursor >= globalCursorData.valueList.length){
                                           	globalCursorData.target.result=null;
                                           }else{
                                            globalCursorData.target.result.value = globalCursorData.valueList[globalCursorData.cursor];
                                           }
                                           globalCursorData.callerRef.onsuccess(globalCursorData);
                                        }
                                   }
                               	  newResult.onsuccess(globalCursorData);
    		                }else{
    		                    newResult.onerror(xmlhttp.responseText);
    		                }
    		            }
    		        };
    		        
    		        xmlhttp.open("POST", "http/db/"+this.collectionType+"/INDEX?indexOn="+this.indexOn+"&key=collectionId&value=" + openCursorOn.lower, true);
    		        xmlhttp.send();
    		        
    				return newResult;
    			}
    	
    	this.Index.collectionType = this.collectionType;
    	return this.Index;
    },
    openCursor:function(a){
    	console.log('objectstore open cursor:'+a+':::'+this.collectionType);

		var newResult = {};
		var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4){ 
               	if (xmlhttp.status == 200) {
                       globalCursorData.valueList = JSON.parse(xmlhttp.responseText),
                   	   globalCursorData.cursor = 0;
                       globalCursorData.target= {};
                       if(globalCursorData.valueList.length>0){
                    	   globalCursorData.target.result={};
                    	   globalCursorData.target.result.value = globalCursorData.valueList[globalCursorData.cursor];
                    	   globalCursorData.callerRef = newResult;
                           globalCursorData.target.result.continue = function(){
                        	   globalCursorData.cursor=globalCursorData.cursor+1;
                               if(globalCursorData.cursor >= globalCursorData.valueList.length){
                               	globalCursorData.target.result=null;
                               }else{
                                globalCursorData.target.result.value = globalCursorData.valueList[globalCursorData.cursor];
                               }
                               globalCursorData.callerRef.onsuccess(globalCursorData);
                            }
                       }
                   	  newResult.onsuccess(globalCursorData);
                }else{
                    newResult.onerror(xmlhttp.responseText);
                }
            }
        };
        xmlhttp.open("POST", "http/db/"+this.collectionType+"/INDEX", true);
        xmlhttp.send();
        
		return newResult;
    },
    delete:function(a){
    	console.log('DELETE called: '+this.collectionType+"->"+ a);
    	var newResult = {};
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4){ 
               	if (xmlhttp.status == 200) {
                    newResult.onsuccess(xmlhttp.responseText);
                }else{
                    newResult.onfailure(xmlhttp.responseText);
                }
            }
        };
        xmlhttp.open("POST", "http/db/"+this.collectionType+"/DELETE?key=" + a, true);
        xmlhttp.send();
    	return newResult;
    },
    clear:function(){
    	console.log('Clear called');
    	var newResult = {};
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4){ 
               	if (xmlhttp.status == 200) {
                    newResult.onsuccess(xmlhttp.responseText);
                }else{
                    alert('Sorry! could not clear history! Please try again later!');
                }
            }
        };
        xmlhttp.open("POST", "http/db/"+this.collectionType+"/CLEAR", true);
        xmlhttp.send();
    	return newResult;
    }
}