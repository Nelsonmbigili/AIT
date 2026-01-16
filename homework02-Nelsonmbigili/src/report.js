import fs from "fs";
import {parse} from "csv-parse";
import * as imdb from "./imdb.js";
import {rowsToObjects} from "./hoffy.js";
import { RootElement, RectangleElement, TextElement } from "./drawing.js";

const csvFilePath = process.argv[2];
if(!csvFilePath){
	console.log("Missing file path");
	console.log("Usage: node src/report.js <csv-path>");
	process.exit(1);
}

function parseRuntime(runtimeStr) {
  if (!runtimeStr) {return 0;}
  const parts = runtimeStr.split(" ");

  const result = parts.reduce(
    (acc, part) => {
      if (part.includes("h")) {acc.hours = Number(part.replace("h", ""));}
      else if (part.includes("m")) {acc.minutes = Number(part.replace("m", ""));}
      return acc;
    },
    { hours: 0, minutes: 0 }
  );

  return result.hours * 60 + result.minutes;
}

fs.readFile(csvFilePath,'utf8', (error, data)=>{
		if(error){
			console.log("Error reading the file. Make sere file exists");
			return;
		}

		parse(
			data,
			{skip_empty_lines: true },
			(err, fileData) => {
				if (err) {
					console.error("Error parsing CSV:", err);
					return;
				}

				const headers = fileData[0];
		        const rows = fileData.slice(1);
		        const dataObject = {headers, rows};
		        const records = rowsToObjects(dataObject);
		        // console.log(records.slice(0,3));

		        const formatedRecords = records.map(record => ({
				      rank: Number(record.rank),
				      title: record.title,
				      year: Number(record.year),
				      rating: Number(record.rating),
				      genres: record.genres.split(",").map(s => s.trim()),
				      tagline: record.tagline,
				      run_time: record.run_time,
				      directors: record.directors.split(",").map(s => s.trim()),
				      actors: record.actors.split(",").map(s => s.trim()),
				      runtime_minutes: parseRuntime(record.run_time),
				 }));

		        // console.log(formatedRecords.slice(0,10));

		        // Printing Textual Report

		        const topMovie = imdb.topRated(formatedRecords);
		        console.log("Top rated movie:");
		        console.log(topMovie);

		        const dramaTitles = imdb.getTitlesByGenre(formatedRecords, "Drama");
                console.log("Drama titles:", dramaTitles.slice(0, 10));

                const topGenres = imdb.topNGenres(formatedRecords, 5);
                console.log("Top 5 genres:", topGenres);

                // Bar chart svg
                const svgWidth = 1000;
				const svgHeight = 500;
				const barWidth = 100;
				const gap = 20;
				const scale = 2;

				const root = new RootElement();
				root.addAttrs({ width: svgWidth, height: svgHeight });

				topGenres.map((genreCount, index) => {
				  const [genre, count] = genreCount;
				  const x = gap + index * (barWidth + gap);
				  const barHeight = count * scale;
				  const y = svgHeight - barHeight; 

				  const rect = new RectangleElement(x, y, barWidth, barHeight, "green");
				  const label = new TextElement(
				    x + barWidth*0.1,
				    y - 5,           
				    14,
				    "black",
				    `${genre}, ${count}`
				  );

				  root.addChild(rect);
				  root.addChild(label);

				  return null; 
				});

				root.write("genres.svg", () => console.log("Wrote genres.svg"));
	        });
    });