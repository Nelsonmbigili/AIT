// hoffy.js
import fs from 'fs';

function getEvenParam(...args){
	// The rest operator is already an array
	return args.filter((elem,index)=>index%2===0);
}

function myFlatten(arr2d){
	const flatArray = arr2d.reduce((accumulator, currentElement)=>{
		accumulator.push(...currentElement);
		return accumulator;
	},[]);
	return flatArray;
}

function maybe(fn){
	return function(...args){
		// arg == null) Checks for both null and undefines unlike arg === null) which only checks null
		if(args.some(arg => arg===null || arg===undefined)){ 
			return undefined;
		}else{
			return fn(...args);
		}
	};
}

// function filterWith(fn){
// 	return function(arr){
// 		const result = arr.reduce((accumulator,element)=>{
// 			if(fn(element)){
// 				accumulator.push(element);
// 			}
// 		    return accumulator;
// 		},[])
// 		return result;
// 	}
// }

function filterWith(fn){
	return function(arr){
		return arr.filter(fn);
	};
}

function repeatCall(fn, n, arg) {
	if(n===0) {return;}
	fn(arg);
	repeatCall(fn,n-1,arg);
}

function limitCallsDecorator(fn, n){ 
	let i=0;
	return function(...args){
		if(i<n){
			i++;
			return fn(...args);
		}else{
			return undefined;
		}
	};
}

function myReadFile(fileName, successFn, errorFn){
	fs.readFile(fileName, 'utf-8', (error, data)=>{
		if(data){
			successFn(data);
		}
		if(error){
			errorFn(error);
		}
	});
}

function stringFieldToList(data, key){
	data[key] = data[key].split(",").map(element => element.trim());
	return data;
}

function rowsToObjects(data){
	const resultObject = data.rows.map(row=>{
		return data.headers.reduce((obj, key, index)=>{
			obj[key] = row[index];
			return obj;
		},{});
	});
	return resultObject;
}


export {
	getEvenParam,
	myFlatten,
	maybe,
	filterWith,
	repeatCall,
	limitCallsDecorator,
	myReadFile,
	stringFieldToList,
	rowsToObjects
};