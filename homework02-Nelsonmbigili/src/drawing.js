// drawing.js
// This is to prevent testDrawing from running when I import the functions defined here
import { pathToFileURL } from 'url';

import fs from "fs";

class GenericElement{
	constructor(name){
		this.name = name;
		this.children=[];
	}

	addAttr(name,value){
		this[name] = value;
	}

	setAttr(name, value){
		this[name] = value;
	}

	addAttrs(obj){
		Object.keys(obj).reduce((_,key)=>{
			this[key]=obj[key];
			return null;
		}, null);
	}

	removeAttrs(arr){
		arr.reduce((_,key)=>{
			delete this[key];
			return null;
		},null);
	}

	addChild(child) {
		this.children = [...this.children, child];
	}

	toString() {
		const attrs = Object.entries(this)
		     .filter(([k]) => !["name", "children", "content"].includes(k))
		     .map(([k, v]) => `${k}="${v}"`)
		     .join(" ");

	    const attrString = attrs.length > 0 ? " " + attrs : "";

		const childrenString = this.children.map(c => c.toString()).join("");

		if (this.content) {
			return `<${this.name}${attrString}>${this.content}</${this.name}>`;
		}
		  return `<${this.name}${attrString}>${childrenString}</${this.name}>`;
	}

	write(fileName,cb){
		fs.writeFile(fileName,this.toString(),'utf8', cb);
	}
}

class RootElement extends GenericElement{
	constructor(){
		super("svg");
		this.xmlns="http://www.w3.org/2000/svg";
	}
}

class RectangleElement extends GenericElement{
	constructor(x,y,width,height,fill){
		super("rect");
		// Object literals converted to key  , value
		this.addAttrs({x,y,width,height,fill});
	}
}

class TextElement extends GenericElement{
	constructor(x,y,fontSize,fill, content){
		 super("text");
	    this.addAttrs({ x, y, "font-size": fontSize, fill });
	    this.content = content;
	}
}

// Testing the drawing
// Commenting this too cz of eslint errors 

function testDrawing(){
	// create root element with fixed width and height
	const root = new RootElement();
	root.addAttrs({width: 800, height: 170, abc: 200, def: 400});
	root.removeAttrs(['abc','def', 'non-existent-attribute']);

	// create circle, manually adding attributes, then add to root element
	const c = new GenericElement('circle');
	c.addAttr('r', 75);
	c.addAttr('fill', 'yellow');
	c.addAttrs({'cx': 200, 'cy': 80});
	root.addChild(c);

	// create rectangle, add to root svg element
	const r = new RectangleElement(0, 0, 200, 100, 'blue');
	root.addChild(r);

	// create text, add to root svg element
	const t = new TextElement(50, 70, 70, 'red', 'wat is a prototype? 😬');
	root.addChild(t);

	// show string version, starting at root element
	console.log(root.toString());

	// write string version to file, starting at root element
	root.write('test.svg', () => console.log('done writing!'));
}



// This is to prevent testDrawing() from running when I import functions defined here
 if (import.meta.url === pathToFileURL(process.argv[1]).href) {
    testDrawing();
}
export{
	GenericElement,
	RootElement,
	RectangleElement,
	TextElement
};
