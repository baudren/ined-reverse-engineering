/*
En revoyant le code, ça fait un peu peur mais bon...
Il y a des trucs à optimiser / factoriser
Un petit tableau serait plus à propos
Si t'as des questions, je suis sur mon siège ^^
*/
var selectedYear = currentYear;
var dataZoneSimLibre = {};

var totalPopulation = 0;// population total

var _minSimulationAge = 0;// age minimum
var _maxSimulationAge = 100;// age maximum

var _defaultFecondite = 2.47;// taux de fécondité par défaut
var _currentFeconditeParam = 2.47;// parametre de fécondité (variable grâce au curseur)

var _defaultEsperance = 75.54;// age d'espérance de vie par défaut
var _currentEsperanceParam = 0;// parametre d'espérance de vie (variable grâce au curseur)

var _defaultBoysAndGirls = 51.2;// rapport garçon / fille
var _boysAndGirls = 51.2;// rapport garçon / fille

var _maxH = 0;// nombre max d'hommes
var _maxF = 0;// nombre max de femmes

var _a0Datas = ''; // tableau a0
var _a1Datas = '';// tableau a1
var _kDatas = '';// tableau k


createSimulationDatas();

$(document).ready(function() {

});



// Création des tableaux
function createSimulationDatas () {
	_a0Datas = libreDatas.param_a0;
	_a1Datas = libreDatas.param_a1;
	_kDatas = libreDatas.param_k;
}


function initSimulationLibreCurve(init, callback){
	dataZoneSimLibre = {};
	dataZoneSimLibre['Male'] = {};
	dataZoneSimLibre['Female'] = {};

	var simStartYear = currentYear;
	if(init){

		//On réinitilaise les valeurs min/max pour la courbe.
		minYearLibreCourbe = Number(currentYear);
		maxYearLibreCourbe = Number(currentYear)+100;

		//On réinitialise les infos sur l'année courante et les sliders aux valeurs par défaut de la sim libre.
		$("#input_simulateur_annee").html(currentYear);
		$("#input_simulateur_annee").attr('aria-valuenow', currentYear);

		//On réinitalise aussi les sliders.
		updateSlidersToDatas(currentYear);

	}else{
		simStartYear = $("#input_simulateur_annee").attr('aria-valuenow');
	}

    updateFeconditeParam($('#slider_simulateur_enfant_femme a').attr('aria-valuenow'));
    updateEsperanceParam($('#slider_simulateur_esperance_vie a').attr('aria-valuenow'));

	dataZoneSimLibre['Male']['fk_pays_id'] = dataZoneSim[simStartYear]['Male']['fk_pays_id'];
	for(var i = _maxSimulationAge ; i >= _minSimulationAge ; i--){
		dataZoneSimLibre['Male']['popu_age'+i] = dataZoneSim[simStartYear]['Male']['popu_age'+i];
		dataZoneSimLibre['Female']['popu_age'+i] = dataZoneSim[simStartYear]['Female']['popu_age'+i];
	}
	dataZoneSimLibre['popu_total'] = {};
	dataZoneSimLibre['popu_total'][simStartYear] = dataZoneSim[simStartYear]['popu_total']/100;

	//Affichage de la pyramid.
	window.pyr.gen(dataZoneSimLibre["Male"], dataZoneSimLibre["Female"], function() {

        $('.infos_zone_chiffre span').html(formatNb(myToFixed(dataZoneSim[simStartYear]['popu_total'])*1000)); //popu_total
        if(callback){callback();}
    });
}

// Update à chaque année qui passe
function changeSimulationLibreCurve() {

	//On récupère l'année sélectionnée.
   	selectedYear = $("#input_simulateur_annee").attr('aria-valuenow');

    //On récupère les données des sliders.
    _currentFeconditeParam = $('#slider_simulateur_enfant_femme a').attr('aria-valuenow');
	_currentEsperanceParam = $('#slider_simulateur_esperance_vie a').attr('aria-valuenow');
	_boysAndGirls = $('#slider_simulateur_garcons_filles a').attr('aria-valuenow');

	var totalBabies = 0; // réinitialisation de bébés.
	totalPopulation = 0; // réinitialisation du total de la population.
	var oldTotalPopulation = 0; // réinitialisation du total de la population passée.

	_maxH = 0; // réinitialisation du nombre d'hommes.
	_maxF = 0; // réinitialisation du nombre de femmes.

	// on part du plus vieux vers le plus jeune sans les premiers (ceux qui viennent de naître)
	for(var i = _maxSimulationAge ; i > _minSimulationAge ; i--){

		// ajout des bébés calculés
		var totalBabiesAge = Number(getSimulationLibreBabies(i, dataZoneSimLibre['Female']['popu_age'+i]));
		totalBabies += Number(totalBabiesAge);

		var _oldTotalHData =  Number(dataZoneSimLibre['Male']['popu_age'+i]);
		var _oldTotalFData =  Number(dataZoneSimLibre['Female']['popu_age'+i]);

		// ajout de la population total passée
		oldTotalPopulation += Number(_oldTotalHData)+Number(_oldTotalFData);

		// récupération du nombre d'homme
		var _yearHData =  Number(getSimulationLibreYearH(i));
		// récupération du nombre de femme
		var _yearFData =  Number(getSimulationLibreYearF(i));

		//On ajoute les valeur dans le nouveau tableau.
		dataZoneSimLibre['Male']['popu_age'+i] = _yearHData;
		dataZoneSimLibre['Female']['popu_age'+i] = _yearFData;
	}

	dataZoneSimLibre['Male']['popu_age'+i] = _yearHData;

	// ajout de la population total passée des anciens nouveaux nés
	oldTotalPopulation += Number(dataZoneSimLibre['Male']['popu_age0'])+Number(dataZoneSimLibre['Female']['popu_age0']);

	dataZoneSimLibre['Male']['popu_age0'] = totalBabies*(_boysAndGirls/100);
	dataZoneSimLibre['Female']['popu_age0'] = totalBabies*(1-(_boysAndGirls/100));

	// on part du plus vieux vers le plus jeune
	for ( var i1 = _maxSimulationAge ; i1 >= _minSimulationAge ; i1-- ) {
		var _yearHData1 =  Number(dataZoneSimLibre['Male']['popu_age'+i1]);
		var _yearFData1 =  Number(dataZoneSimLibre['Female']['popu_age'+i1]);

		// ajout de la population total en cours
		totalPopulation += _yearHData1+_yearFData1;
	}

	dataZoneSimLibre['popu_total'][selectedYear] = totalPopulation/100; //Pour que ce soit en millions.

	var result = Number(getSimulationLibreYearPopulation(totalPopulation,oldTotalPopulation))*1000;
	totalPopulation = result;

	window.pyr.gen(dataZoneSimLibre["Male"], dataZoneSimLibre["Female"], function() {
        $('.infos_zone_chiffre span').html(formatNb(myToFixed(totalPopulation))).attr('aria-valuenow', myToFixed(totalPopulation)); //popu_total
        $('.infos_zone_chiffre').textfill();
    });

}

// calcul de la nouvelle population: juste arrondi à 2 chiffres
function getSimulationLibreYearPopulation (_newVal,_oldVal) {
	return myToFixed(_newVal, 2);//_newPopulation;

}

// calcul du nombre de bébé
function getSimulationLibreBabies (_n,_val) {
	var _tmpPow = Number(100/Number(_currentFeconditeParam));
	var _tmpKi = Math.pow(Number(getKParam(_n)), Number(_tmpPow));
	var _tmpB = Number( Number(_currentFeconditeParam)/100);
	var _tmpVal = Number(_val)*( Number(_tmpKi)* Number(_tmpB)/1.28);

	if(_tmpVal <= 0 || isNaN(_tmpVal) || _tmpVal == undefined) return 0;

	return _tmpVal;
}

// calcul du nombre d'homme
function getSimulationLibreYearH (_n) {

	// récupération de la valeur i - 1 à faire évoluer
	var _tmpVal = Number(dataZoneSimLibre['Male']['popu_age'+(_n-1)]);

	// récupération du param a0 pour l'age i
	var _tmpA0 = Number(getA0Param(_n));
	// récupération du param a0 pour l'age 84
	var _tmpA084 = Number(getA0Param(84));

	// récupération du param a1 pour l'age i
	var _tmpA1 = Number(getA1Param(_n));
	// récupération du param a1 pour l'age 84
	var _tmpA184 = Number(getA1Param(84));

	// nouvelle valeur
	var _newVal = 0;
	// résultat temporaire
	var _tmpRes = 0;

	if(_n == 1){
		_tmpRes = _tmpA0+_tmpA1*log10(100-_currentEsperanceParam);
		_newVal = _tmpVal-_tmpVal*(Math.pow(10,_tmpRes)/1000);
	}else if(_n >= 2 && _n < 5){
		_tmpRes = 1-Math.exp(0.25*Math.log(1-Math.pow(10,_tmpA0+_tmpA1*log10(100-_currentEsperanceParam))/1000));
		_newVal = _tmpVal-_tmpVal*_tmpRes;
	}else if(_n >= 5 && _n <= 84){
		_tmpRes = 1-Math.exp(0.20*Math.log(1-Math.pow(10,_tmpA0+_tmpA1*log10(100-_currentEsperanceParam))/1000));
		_newVal = _tmpVal-_tmpVal*_tmpRes;
	}else if(_n >= 85 && _n <= 89){
		_tmpRes = 1-Math.exp(0.20*Math.log(1-Math.pow(10,_tmpA084+_tmpA184*log10(100-_currentEsperanceParam))/1000));
		_newVal = _tmpVal-_tmpVal*((0.3378+0.69798*5*_tmpRes)/5);
	}else if(_n >= 90 && _n <= 94){
		_newVal = _tmpVal-_tmpVal*0.25;
	}else if(_n >= 95 && _n <= 99){
		_newVal = _tmpVal-_tmpVal*0.4;
	}else if(_n >= 100 && _n <= 109){
		_newVal = _tmpVal-_tmpVal*0.5;
	}else{
		_newVal = 0;
	}

	//if(_newVal <= 0 || _newVal == 'NaN' || _newVal == undefined) return 0;
	if(_newVal <= 0 || isNaN(_newVal) || _newVal == undefined) return 0;

	return _newVal;
}

// calcul du nombre de femme
function getSimulationLibreYearF (_n) {
	// récupération de la valeur i - 1 à faire évoluer
	var _tmpVal = Number(dataZoneSimLibre['Female']['popu_age'+(_n-1)]);

	// récupération du param a0 pour l'age i
	var _tmpA0 = Number(getA0Param(_n));
	// récupération du param a0 pour l'age 84
	var _tmpA084 = Number(getA0Param(84));

	// récupération du param a1 pour l'age i
	var _tmpA1 = Number(getA1Param(_n));
	// récupération du param a1 pour l'age 84
	var _tmpA184 = Number(getA1Param(84));

	// nouvelle valeur
	var _newVal = 0;
	// résultat temporaire
	var _tmpRes = 0;

	if(_n == 1){
		_tmpRes = _tmpA0+_tmpA1*log10(100-_currentEsperanceParam);
		_newVal = _tmpVal-_tmpVal*(Math.pow(10,_tmpRes)/1000);
	}else if(_n >= 2 && _n < 5){
		_tmpRes = 1-Math.exp(0.25*Math.log(1-Math.pow(10,_tmpA0+_tmpA1*log10(100-_currentEsperanceParam))/1000));
		_newVal = _tmpVal-_tmpVal*_tmpRes;
	}else if(_n >= 5 && _n <= 84){
		_tmpRes = 1-Math.exp(0.20*Math.log(1-Math.pow(10,_tmpA0+_tmpA1*log10(100-_currentEsperanceParam))/1000));
		_newVal = _tmpVal-_tmpVal*_tmpRes;
	}else if(_n >= 85 && _n <= 89){
		_tmpRes = 1-Math.exp(0.20*Math.log(1-Math.pow(10,_tmpA084+_tmpA184*log10(100-_currentEsperanceParam))/1000));
		_newVal = _tmpVal-_tmpVal*((0.3378+0.69798*5*_tmpRes)/5);
	}else if(_n >= 90 && _n <= 94){
		_newVal = _tmpVal-_tmpVal*0.15;
	}else if(_n >= 95 && _n <= 99){
		_newVal = _tmpVal-_tmpVal*0.2;
	}else if(_n >= 100 && _n <= 109){
		_newVal = _tmpVal-_tmpVal*0.3;
	}else{
		_newVal = 0;//tout aussi débile car 0
	}
	if(_newVal <= 0 || isNaN(_newVal) || _newVal == undefined) return 0;


	return _newVal;
}

// récupération du param k pour l'age i
function getKParam (_n) {
	return Number(_kDatas[_n]);
	//return Number(_kDatas.items['k_'+_n].item._data);
}

// récupération du param a0 pour l'age i
function getA0Param (_n) {
	return Number(_a0Datas[_n]);
	//return Number(_a0Datas.items['k_'+_n].item._data);
}

// récupération du param a1 pour l'age i
function getA1Param (_n) {
	return Number(_a1Datas[_n]);
	//return Number(_a1Datas.items['k_'+_n].item._data);
}


function log10(x) {
     return Math.log(x) / Math.LN10;
}



function roundPrecision (_val,_pre,_NumericOrString,_force0) {

	var _tmpPrec =  _val.split('.');
	var _separator = (_NumericOrString) ? '.' : ((lg == 'en') ? '.' : ',');

	if(_NumericOrString && _tmpPrec.length < 2) return Number(_tmpPrec[0]);
	if(!_NumericOrString && _tmpPrec.length < 2 && _force0 == undefined) return _tmpPrec[0];

	var _tmpPrec0 = (_tmpPrec.length < 2) ? '0' : _tmpPrec[1].substring(0,_pre);

	if(_tmpPrec0.length < _pre && _force0){
		while(_tmpPrec0.length < _pre){
			_tmpPrec0 =_tmpPrec0+'0';
		}
	}

	var tmpVal = _tmpPrec[0]+_separator+_tmpPrec0;

	return (_NumericOrString) ? Number(tmpVal) : tmpVal;
}