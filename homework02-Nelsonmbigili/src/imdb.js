// imdb.js
import * as hoffy from './hoffy.js';

function topRated(records){
	const filterFn = hoffy.filterWith(element => !isNaN(element.rating));
	const filteredRecords = filterFn(records);
	const topRated = filteredRecords.reduce((topRated, element) => {
		return element.rating > topRated.rating? element : topRated;
	},records[0]);
	return topRated;
}

function genreCounts(records){
	const validRecords = records.filter(record =>
		Array.isArray(record.genres) && 
        record.genres.some(genre => genre.trim() !== "")
    );
	const allGenres2D = validRecords.map(record => record.genres);
	const genres = hoffy.myFlatten(allGenres2D);

	const counts = genres.reduce((acc, element)=>{
		if(!(element in acc)){
			acc[element] = 1;
		}else{
			acc[element] += 1;
		}
		return acc;
	},{});
	return counts;
}

function getTitlesByGenre(records, genre) {
	const genreLowerCase = genre.toLowerCase();
	

	const validRecords = records.filter(record=>
		Array.isArray(record.genres) && 
		Number.isInteger(record.year) &&
		record.genres.some(
			g => typeof g === "string" && g.trim().toLowerCase()=== genreLowerCase
		)
	);

	const titles = validRecords.map(
		record => `${record.title.toUpperCase()} (${record.year})`
		);

	return titles;
}


function topNGenres(records, n){
	const counts = genreCounts(records);
	const pairs = Object.entries(counts);
	pairs.sort((a, b) => b[1] - a[1]);
	return pairs.slice(0, n);
}


export{
	topRated,
	genreCounts,
	getTitlesByGenre,
	topNGenres
};
