var currentDate = new Date();
var currentYear = currentDate.getFullYear();
var startYear = currentYear;

var popbirdyear = 0;
var popcurrentyear = 0;
var dataZone = {};
var dataZoneGen = {};

var dataZoneSim = {};

var dataSurvie = {};
var dataTrads = {};
var lg = getParam("lang") ? getParam("lang") : "fr";
var activeAjaxCount = 0;
//var q = new binder(function() {q.getZones(parseDataForZones);});

var tabActive = '';
var simulateur_categorie;

var minYearLibreCourbe = Number(currentYear);
var maxYearLibreCourbe = Number(minYearLibreCourbe) + 100;


$(document).ajaxStart(function () {
    activeAjaxCount++;
    $("#loading").show();
});

$(document).ajaxStop(function () {
    setTimeout(function () {
        activeAjaxCount--;
        $("#loading").fadeOut(100);
    }, 200);
});

$(document).ready(function () {


    /*********************************************************************/
    //Ce qu'on a besoin de faire dès le départ.
    /*********************************************************************/

    //$('#simulateur_introduction').show();
    //$('#simulateur_module').hide(); //On cache le module pour qu'il ne reste que l'intro.


    /*********************************************************************/
    //Déclaration du binder.
    /*********************************************************************/

    var q = new binder(function (b) {

        FastClick.attach(document.body);

        //On commence par récupérer toutes les trads associés à la population
        //et on les stoques dans un tableau.
        q.getTrads(function (data) {
            //console.log(data);
            dataTrads["fr"] = {};
            dataTrads["en"] = {};
            dataTrads["es"] = {};
            for (p in data) {

                //Version lg => identifiant => trad.
                dataTrads["fr"][data[p].trad_id] = data[p].trad_fr;
                dataTrads["en"][data[p].trad_id] = data[p].trad_en;
                dataTrads["es"][data[p].trad_id] = data[p].trad_es;
            }


            //Avant toute chose, on load le template avec les trads adaptées à la langue.
            $("#script_template_container").loadTemplate("#template", dataTrads[lg]);
            genSliders(); //Les sliders.
            window.pyr = new pyramid('#graphique_tableau');
            genTabs(); //Les onglets.

            //Affichage des zones.
            b.getZones(parseDataForZones);

            //console.log(dataTrads);
            //console.log(dataTrads[lg]['trad']);
        });
    });


    //Au redimensionnement de la fenêtre.
    $(window).resize(function () {
        TweenMax.to("#tabs_cursor", 0, {"left": getCursorPos()});
        getCourbes(simulateur_categorie); //Vérifier si ça ne fait pas trop ramer...
    });


    /*********************************************************************/
    //On déclare tous les sliders dont on a besoin.
    /*********************************************************************/

    //Les sliders.
    function genSliders() {
        genCustomSlider("#slider_simulateur_esperance_vie", 75, 15, 90, "", "", false, 1, "simulateur");
        genCustomSlider("#slider_simulateur_enfant_femme", 2, 0, 14, "", "", false, 1, "simulateur", false, false, 0.01);
        genCustomSlider("#slider_simulateur_garcons_filles", 50, 0, 100, "", "", false, 1, "simulateur", false, true, 0.1);
    }

    //Zone affichage population en textFill.
    $('.infos_zone_chiffre').textfill();


    /*********************************************************************/
    //Gestion des onglets.
    /*********************************************************************/

    function genTabs() {

        /*

        //On commence par récupérer la liste des pages.
        $("#contenu").prepend('<div id="tabs_menu"><ul id="tabs_menu_content"></ul><div id="tabs_cursor"></div></div>');
        $("#contenu .categorie h2").each(function(index) {
            var tabTitre = $(this).html();
            var tabId = $(this).parent('section').attr("id");
            var tabCat = $(this).parent('section').attr("data-categorie");
            $("#tabs_menu_content").append('<li><a href="#' + tabId + '" data-categorie="' + tabCat + '"><span>' + tabTitre + '</span></a></li>');
            $(this).hide(); //On cache tous les titres h2 du contenu qui apparaissent dans les onglets.
        });

       */

        //Création des onglets.
        $("#contenu").tabs({
            create: function (event, ui) {
                var tabSelected = $("#tabs_menu ul li.ui-state-active");
                TweenMax.to("#tabs_cursor", 0, {"left": getCursorPos()});
                TweenMax.to(tabSelected, 1, {backgroundColor: "#1FBDC3"});

                //En fonction de l'onglet cliqué.
                simulateur_categorie = $(tabSelected).children('a').data('categorie');

                setTimeout(function () {
                    switch (simulateur_categorie) {
                        case 'simulateur_onu':
                            displaySliders("#slider_simulateur_esperance_vie, #slider_simulateur_enfant_femme, #slider_simulateur_garcons_filles", true);
                            break;

                        case 'simulateur_libre':
                            displaySliders("#slider_simulateur_esperance_vie, #slider_simulateur_enfant_femme, #slider_simulateur_garcons_filles", false);
                            break;
                    }

                    //On change le format de la vitesse si on démarre en mode fr.
                    if (lg == 'fr') $('#input_simulateur_vitesse').html('0,2');

                }, 200);

            },
            activate: function (event, ui) {
                var tabSelected = $(ui.newTab.context).parent('li');
                TweenMax.to("#tabs_cursor", 0.5, {"left": getCursorPos()});
                TweenMax.to("#tabs_menu li", 0.6, {backgroundColor: "#222E3B"});
                TweenMax.to(tabSelected, 1, {backgroundColor: "#1FBDC3"});


                //simulationStop(tlAnnim);
                if ($("#input_simulateur_annee").attr('aria-valuenow') == currentYear) {
                    simulationStop(tlAnnim, true);
                } else {
                    simulationStop(tlAnnim);
                }


                //En fonction de l'onglet cliqué.
                simulateur_categorie = $(ui.newTab.context).data('categorie');


                /*
                //On réinitialise quelques trucs quand on repasse sur la simu ONU.
                //simulationStop(tlAnnim);
                minYearLibreCourbe = Number(currentYear);
                maxYearLibreCourbe = Number(minYearLibreCourbe) + 100;

                startYear = currentYear;
                $('.cf span.gen_year').html(startYear);

                $("#input_simulateur_annee").html(currentYear);
                $("#input_simulateur_annee").attr('aria-valuenow', currentYear);


                var displaySlidersValue = (simulateur_categorie == 'simulateur_onu') ? true : false;
                displaySliders("#slider_simulateur_esperance_vie, #slider_simulateur_enfant_femme, #slider_simulateur_garcons_filles", displaySlidersValue);
                getDataAndUpdate();
                */


                switch(simulateur_categorie){
                    case 'simulateur_onu':

                        //On réinitialise quelques trucs quand on repasse sur la simu ONU.
                        //simulationStop(tlAnnim);
                        minYearLibreCourbe = Number(currentYear);
                        maxYearLibreCourbe = Number(minYearLibreCourbe)+100;

                        startYear = currentYear;
                        $('.cf span.gen_year').html(startYear);

                        $("#input_simulateur_annee").html(currentYear);
                        $("#input_simulateur_annee").attr('aria-valuenow', currentYear);


                        displaySliders("#slider_simulateur_esperance_vie, #slider_simulateur_enfant_femme, #slider_simulateur_garcons_filles", true);
                        getDataAndUpdate();
                        break;

                    case 'simulateur_libre':

                        displaySliders("#slider_simulateur_esperance_vie, #slider_simulateur_enfant_femme, #slider_simulateur_garcons_filles", false);
                        initSimulationLibreCurve(false);
                        getCourbes(simulateur_categorie);

                        //$('#input_wrapper_annee').children('.ibutton_less').css({'opacity':'0.5'});
                        break;
                }


                //On updtate l'opacité de l'input année.
                var ibutton_value_min = (simulateur_categorie == 'simulateur_libre') ? $('#input_simulateur_annee').attr('aria-valuemin') : 1950;
                setInputBtnOpacity('#input_simulateur_annee', false, ibutton_value_min);
            }

        });

    }

    function getCursorPos() {
        var tabSelected = $("#tabs_menu ul li.ui-state-active");
        var tabPosX = $(tabSelected).position().left;
        var tabWidth = $(tabSelected).width();

        var newPos = tabPosX + (tabWidth / 2) - 5;
        return newPos;
    }


    /*********************************************************************/
    //Gestion de l'introduction.
    /*********************************************************************/

    //On ajoute une petite astuce pour les écrans tactiles afin de gérer le grow sur les boutons.
    $(document).on('touchstart touchend', '.hvr-grow', function (e) {
        //e.preventDefault();
        //$(this).toggleClass('hvr-grow-hover');

        if (e.type == 'touchend') {
            $(this).css({'-webkit-transform': 'scale(1)', 'transform': 'scale(1)'});
        } else {
            $(this).css({'-webkit-transform': 'scale(1.1)', 'transform': 'scale(1.1)'});
        }
    });

    $(document).on("click", ".btn_intro", function (e) {
        var tlIntro = new TimelineMax();

        //On récupère le type de bouton cliqué.
        var btn_type = $(this).attr('id');

        //On masque l'introduction et on affiche le module.
        tlIntro.to('#simulateur_introduction', 0.3, {opacity: 0, display: "none"});
        tlIntro.to('#simulateur_module', 0, {opacity: 0, display: "block"});
        tlIntro.to('#simulateur_module', 0.5, {opacity: 1});
        //tlIntro.to("#tabs_cursor", 0, {"left": getCursorPos()});

        //On sélectionne le bon onglet.
        tlIntro.addCallback(function () {

            //On sélectionne le bon onglet.
            switch (btn_type) {
                case 'intro_btn_onu':
                    $("#contenu").tabs("option", "active", 0);
                    break;

                case 'intro_btn_libre':
                    $("#contenu").tabs("option", "active", 1);
                    break;
            }

            TweenMax.to("#tabs_cursor", 0, {"left": getCursorPos()});
        });
    });


    /*********************************************************************/
    //Gestion des popups.
    /*********************************************************************/

    function genPopup(type) {

        switch (type) {
            case 'projections':

                var content = '<p>' + dataTrads[lg]['simulateur_alert_projections_onu_1'] + ' 2100<br />' + dataTrads[lg]['simulateur_alert_projections_onu_2'] + '</p>';
                content += '<div id="popup_btn_play_libre" class="hvr-grow btn_play" role="button" aria-selected="false">' + dataTrads[lg]['sim_demarrer_simulation_libre'] + '</div>';
                content += '<div id="popup_links">';
                content += '<a id="link_simulation_onu" href="">' + dataTrads[lg]['sim_redemarrer_simulation_onu'] + '</a>';
                content += '<a id="link_annuler" href="">' + dataTrads[lg]['sim_annuler'] + '</a>';
                content += '</div>';

                break;

            case 'alert1':

                var content = '<p>' + dataTrads[lg]['simulateur_alert_minimum_population_texte'] + '</p>';
                content += '<div id="popup_btn_restart_libre" class="hvr-grow btn_play" role="button" aria-selected="false">' + dataTrads[lg]['sim_recommencer'] + '</div>';

                break;
        }

        $('#popup #popup_content').html(content);
        $('#popup').fadeIn(200).css({'opacity': 1});
    }

    $(document).on("click", "#popup_close", function () {
        $('#popup').fadeOut(200).css({'opacity': 0});
    });


    $(document).on("click", "#popup_btn_play_libre", function () {
        $("#contenu").tabs("option", "active", 1);
        $('#popup').fadeOut(200, function () {
            simulationPlay(); //true
        });
    });

    $(document).on("click", "#popup_btn_restart_libre", function () {
        $('#popup').fadeOut(200, function () {
            initSimulationLibreCurve(true, function () {
                simulationPlay(true);
            });
        });
    });


    $(document).on("click", "#popup_links a", function (e) {

        e.preventDefault();
        var link_id = $(this).attr('id');

        switch (link_id) {
            case 'link_simulation_onu':
                //alert('link_simulation_onu');
                $('#popup').fadeOut(200).css({'opacity': 0});

                //$("#input_simulateur_annee").html(currentYear);
                //$("#input_simulateur_annee").attr('aria-valuenow', currentYear);

                simulationPlay(true);
                break;

            case 'link_annuler':
                $('#popup').fadeOut(200).css({'opacity': 0});
                break;
        }
    });


    /*********************************************************************/
    //Gestion des zones.
    /*********************************************************************/

    /**
     * On réaffiche les boutons dans la liste des continents
     * à partir de la base de données.
     */
    //q.getZones(parseDataForZones);
    function parseDataForZones(data) {

        $(".liste_continents, select#select_liste_continents").html(""); //On vide la liste des continents sur chaque page.
        for (p in data) {

            var pays_id = data[p].pays_id;
            var pays_titre = data[p]['pays_nom_' + lg];
            var pays_titre_nice = niceName(pays_titre);
            var pays_titre_zone = niceName(data[p].pays_nom_fr);
            var pressed = (p == 0) ? true : false;

            //On rempli le select des régions (zones).
            $("select#select_liste_continents").append('<option role="option" aria-selected="' + pressed + '" data-zone="' + pays_titre_zone + '" value="' + pays_id + '">' + pays_titre.toUpperCase() + '</option>');
        }

        //Après avoir attribué les différentes valeurs aux zones,
        //on affiche les infos du monde par défaut.
        setTimeout(function () {
            updateZoneList(900);
            updateOptionSelectedAria("select#select_liste_continents");

            //On déclare les class de select à customiser.
            $('.select_style').customSelect();
        }, 100);
    }


    /*********************************************************************/
    //Gestion de l'annimation de simulation.
    /*********************************************************************/
    var tlAnnim;

    $(document).on("click", "#simulateur_btn_play", function () {
        var btnSelected = $(this).attr('aria-selected');

        if (btnSelected == 'false') {
            simulationPlay();
        } else {
            simulationStop(tlAnnim);
        }
    });


    /**
     * Lancement de l'annimation
     */
    function simulationPlay(restart) {
        //var restart = restart;

        $('#simulateur_btn_play').attr('aria-selected', true)
            .css({'background-image': 'url("./img/picto_pause.png")'})
            .html(dataTrads[lg]['simulateur_stop_simulation']);

        //Si on est en mode "restart", on redéfinie l'année courante.
        if (restart) {
            $("#input_simulateur_annee").html(currentYear);
            $("#input_simulateur_annee").attr('aria-valuenow', currentYear);
        }

        //Si l'anim existe déjà et à été lancée, on la stop.
        if (tlAnnim)
            simulationStop(tlAnnim, false, true);

        //On (re)lance l'annimation.
        tlAnnim = new TimelineMax({onComplete: timelineDone});

        tabActive = getTabActive();
        if (tabActive == 'simulateur_libre') {

            tlAnnim.addCallback(function () {

                var newPopulation = Number($(".infos_zone_chiffre span").attr('aria-valuenow'));
                var newValue = Number($("#input_simulateur_annee").attr('aria-valuenow')) + 1;
                newValue = newValue.toFixed(1).replace(".0", "").replace(",0", "");

                if (newPopulation <= 10000 && !restart) {
                    genPopup('alert1');
                    simulationStop(tlAnnim);

                } else {
                    $("#input_simulateur_annee").html(newValue);
                    $("#input_simulateur_annee").attr('aria-valuenow', newValue);
                }

                restart = false;
                updatePyramid();
            }, "+=0.5");

        } else {

            //On désactive les sliders.
            //displaySliders("#slider_simulateur_esperance_vie, #slider_simulateur_enfant_femme, #slider_simulateur_garcons_filles", true);

            tlAnnim.addCallback(function () {

                var valueMax = Number($("#input_simulateur_annee").attr('aria-valuemax'));
                var newValue = Number($("#input_simulateur_annee").attr('aria-valuenow')) + 1;
                newValue = newValue.toFixed(1).replace(".0", "").replace(",0", "");

                if (newValue > valueMax) {

                    genPopup('projections');
                    simulationStop(tlAnnim);

                    $('#input_wrapper_annee .ibutton_more').css({'opacity': '0.5'});

                } else {
                    $("#input_simulateur_annee").html(newValue);
                    $("#input_simulateur_annee").attr('aria-valuenow', newValue);

                    updatePyramid();
                }

            }, "+=0.5");
        }


        function timelineDone() {

            var vitesse = $("#input_simulateur_vitesse").attr('aria-valuenow');
            tlAnnim.timeScale(vitesse * 2);
            tlAnnim.restart();
        }
    }


    /**
     * On stop l'animation.
     */
    function simulationStop(tlAnnim, first, stop2restart) {

        if (first) {
            $('#simulateur_btn_play').attr('aria-selected', false)
                .css({'background-image': 'url("./img/picto_play.png")'})
                .html(dataTrads[lg]['simulateur_start_simulation']);

        } else if (!stop2restart) {
            $('#simulateur_btn_play').attr('aria-selected', false)
                .css({'background-image': 'url("./img/picto_play.png")'})
                .html(dataTrads[lg]['simulateur_continue_simulation']);

            //On active les sliders.
            //displaySliders("#slider_simulateur_esperance_vie, #slider_simulateur_enfant_femme, #slider_simulateur_garcons_filles", false);
        }

        if (tlAnnim)
            tlAnnim.kill();
    }


    /*********************************************************************/
    //Gestion de la region.
    /*********************************************************************/

    $(document).on("change", "select#select_liste_continents", function () {
        var valueSelected = $(this).val();
        updateZoneList(valueSelected);
        updateOptionSelectedAria(this);
    });

    $(document).on("change", "select#select_liste_pays", function () {
        updateOptionSelectedAria(this);
    });


    function updateOptionSelectedAria(element) {

        var elementId = $(element).attr('id');
        var selectType = (elementId.indexOf("continents") != -1) ? 'zone' : 'pays';

        $(element).find('option').attr('aria-selected', false);
        var optionSelected = $(element).find('option:selected');
        $(optionSelected).attr('aria-selected', true);

        //On met à jour le titre de la zone sélectionnée.
        var formId = $(element).parent('div').parent('form').attr('id');
        var optionZone = $('#' + formId + ' select:eq(0)').find('option:selected');
        var optionPays = $('#' + formId + ' select:eq(1)').find('option:selected');

        //On met à jour le titre de la zone sélectionnée.
        var zoneSelectedName = (selectType == 'pays' && optionPays.val() && optionPays.val() != 0) ? $(optionPays).html() : $(optionZone).html();
        $('.infos_zone').html(zoneSelectedName);
        //$('.infos_zone').html(optionSelected.html());

        //Seulement pour la liste des pays, on affiche la nouvelle pyramide.
        if ($(element).attr("id") == "select_liste_pays") {
            getDataAndUpdate();
        }
    }


    function updateZoneList(idZone) {

        if (idZone == 900) {
            q.getPays(lg, updatePaysList);
        } else {
            q.getPaysZone(idZone, lg, updatePaysList);
        }
    }


    function updatePaysList(data) {

        $("#choix_pays").find('span.customSelectInner').html('-----');
        $("select#select_liste_pays").html('<option role="option" aria-selected="true" data-pays="null" value="0">-----</option>');
        for (p in data) {

            var pays_id = data[p].pays_id;
            var pays_titre = data[p]['pays_nom_' + lg];
            var pays_titre_nice = niceName(pays_titre);
            var pays_titre_zone = niceName(data[p].pays_nom_fr);
            //var pressed = (p == 0) ? true : false;
            var pressed = false;
            //On rempli le select des pays.
            $("select#select_liste_pays").append('<option role="option" aria-selected="' + pressed + '" data-pays="' + pays_titre_zone + '" value="' + pays_id + '">' + pays_titre + '</option>');
        }

        getDataAndUpdate();
    }


    /*********************************************************************/
    //Gestion de la pyramide.
    /*********************************************************************/

    /**
     * V2. Permet de mettre à jour la pyramide en fonction du lieu
     * sans effectuer de requête à chaque fois.
     */
    var sliderAnnee = false;

    function updatePyramid() {

        //changeSimulationLibreCurve();

        tabActive = getTabActive();
        if (tabActive == 'simulateur_libre') {

            changeSimulationLibreCurve();

        } else {

            if (!sliderAnnee) {
                sliderAnnee = $('#input_simulateur_annee');
            }

            //On récupère l'année sélectionnée.
            var selectedYear = sliderAnnee.attr('aria-valuenow');

            //On affiche les bonnes données dans le slider.
            updateSlidersToDatas(selectedYear);

            //On updtate l'opacité de l'input année.
            var ibutton_value_min = (simulateur_categorie == 'simulateur_libre') ? $('#input_simulateur_annee').attr('aria-valuemin') : 1950;
            setInputBtnOpacity('#input_simulateur_annee', false, ibutton_value_min);

            //On affiche la nouvelle pyramide.
            window.pyr.gen(dataZoneSim[selectedYear]["Male"], dataZoneSim[selectedYear]["Female"], function () {
                $('.infos_zone_chiffre span').html(formatNb(myToFixed(dataZoneSim[selectedYear]["popu_total"] * 1000))); //popu_total
                $('.infos_zone_chiffre').textfill();
            });
        }

        //On update la courbe.
        getCourbes(simulateur_categorie);
    }


    /**
     * Permet de récupérer les données et de mettre la pyramide à jour.
     */
    function getDataAndUpdate() {

        //on stop l'eventuel simulation si elle est lancée.
        simulationStop(tlAnnim, true);

        setTimeout(function () {
            var idPays = $("select#select_liste_pays").find('option:selected').val();
            var idZone = $("select#select_liste_continents").find('option:selected').val();
            var id = (idPays != 0) ? idPays : idZone;
            //var popu_total_max = 0;


            dataZoneSim = {}; //On supprime toutes les infos pouvant avoir été stoquées.
            q.getDataForZoneSim(id, function (data) {

                for (p in data) {

                    if (!dataZoneSim[data[p].popu_annee]) {
                        dataZoneSim[data[p].popu_annee] = {};
                        var popu_total = Number(data[p].popu_total);

                    } else {
                        popu_total = Number(popu_total) + Number(data[p].popu_total);
                        dataZoneSim[data[p].popu_annee]['popu_total'] = popu_total;
                    }

                    var sexe = data[p].popu_sexe;
                    dataZoneSim[data[p].popu_annee][sexe] = data[p];

                    /*
                     //On essaye de récupérer la valeur maximum de la population
                     //sur toutes les années dont on possède les données.
                     var max = 0;
                     for (var i = 99; i >= 0; i--) {
                         max = Math.max(data[p]['popu_age' + i], max);
                     }

                     if (popu_total_max < max) {
                         popu_total_max = max;
                     }
                     */
                }

                /*
                var max = dataZoneSim['max'] = roundSup(popu_total_max);
                var maxm = Math.round(max / 2);

                $("#graphique_legende .val_homme_max")[0].innerHTML = (max);
                $("#graphique_legende .val_homme_medium")[0].innerHTML = (maxm);
                $("#graphique_legende .val_femme_medium")[0].innerHTML = (maxm);
                $("#graphique_legende .val_femme_max")[0].innerHTML = (max);
                */

                initSimulationLibreCurve(true);
                updatePyramid();
            });

            //console.log(dataZoneSim);
        }, 100);
    }


    /**
     * Construction de la pyramide.
     */
    pyramid = function (obj) {
        var conteneur = $(obj);


        //On construit le tableau de 100 valeurs.
        var table = ['<table class="pyramid" width="100%" cellspacing="0" cellpadding="0"><caption></caption>'];
        var tabObj = {};
        var ageTexte = '';

        for (var p = 99; p >= 0; p--) {
            ageTexte = (p != 0) ? '(' + p + ' ' + dataTrads[lg]["sim_ans"] + ')' : '';

            //console.log(ageTexte);

            table.push('<tr data-age="' + p + '">');
            table.push('<td><span id="sh' + p + '" class="sh" style="width:100%;"></span></td>');
            table.push('<th>' + p + '</th>');
            table.push('<td><span id="sf' + p + '" class="sf" style="width:100%;"></span><span id="cf' + p + '" class="cf">' + dataTrads[lg]['simulateur_generation_nee_en'] + ' <span class="gen_year">' + currentYear + '</span> ' + ageTexte + '</span></td></tr>');
        }

        table.push('</table>');
        conteneur.html(table.join(''));
        for (var p = 99; p >= 0; p--) {
            tabObj['sh' + p] = document.getElementById('sh' + p);
            tabObj['sf' + p] = document.getElementById('sf' + p);
        }

        var tableDiv = conteneur.find('>table');

        //var sliderPlace = $("#slider_place");
        //var sliderAnnee = $("#slider_place_annee");


        //On récupère l'année de départ pour la démarcation
        var limitAge = parseInt(selectedYear) - parseInt(currentYear);


        //On insert les valeurs correspondantes aux hommes et aux femmes.
        this.gen = function (homme, femme, callback) {

            /**
             * On récupère les valeurs actuelles
             */
                //var selectedAge = sliderPlace.slider('value');
                //var selectedYear = sliderAnnee.slider('value');

            var selectedYear = $('#input_simulateur_annee').attr('aria-valuenow');


            /**
             * On cherche l'année en cours
             * pour mettre la démarcation rouge
             */
            //limitAge = parseInt(selectedYear) - parseInt(currentYear) + parseInt(selectedAge);
            //limitAge = parseInt(selectedYear) - parseInt(currentYear);
            limitAge = parseInt(selectedYear) - parseInt(startYear);


            /**
             * On l'enlève sur la précédente
             */
            tableDiv.find('tr.limiteAge').removeAttr('class');
            var cf = $('#cf' + limitAge);

            if (cf.length) {
                /**
                 * On la met sur la nouvelle
                 */
                cf.closest('tr').addClass('limiteAge');
            }
            if (limitAge > 99) {
                /**
                 * Ou sur 99 si on est plus agé ...
                 * Mais en désactivé (ancienne version)
                 */
                //tableDiv.find('tr[data-age=99]').addClass('limiteAge disabled');

                //On repart avec une nouvelle génération avec 100ans de plus (nouvelle version).
                startYear = startYear + 100;
                $('.cf span.gen_year').html(startYear);
            }

            //Récupération de la population max sur l'ensemble des années (ancienne version).
            //var max = dataZoneSim['max'];


            //On essaye de récupérer la valeur maximum de la population
            //sur toutes les années dont on possède les données (nouvelle version).
            var max = 0;
            var popu_total_max = 0;

            for (var i = 99; i >= 0; i--) {
                //max = Math.max(data[p]['popu_age' + i], max);
                max = Math.max(homme['popu_age' + i], max);
                max = Math.max(femme['popu_age' + i], max);
            }

            //max = max*1.1;
            if (popu_total_max < max) {
                popu_total_max = max;
            }


            var max = dataZoneSim['max'] = roundSup(popu_total_max);
            var maxm = Math.round(max / 2);

            //On affiche les légendes adaptées.
            $("#graphique_legende .val_homme_max")[0].innerHTML = (max);
            $("#graphique_legende .val_homme_medium")[0].innerHTML = (maxm);
            $("#graphique_legende .val_femme_medium")[0].innerHTML = (maxm);
            $("#graphique_legende .val_femme_max")[0].innerHTML = (max);

            //max = max/1.5;

            /**
             * Test pour ne pas refaire tout le tableau si on juste changé
             * d'age et pas d'année
             */
            //if (previousYear !== selectedYear) {

            for (var p = 99; p >= 0; p--) {

                var popuAgeH = homme['popu_age' + p];
                var popuAgeF = femme['popu_age' + p];

                tabObj['sh' + p].style.width = (popuAgeH / max * 100) + '%';
                tabObj['sf' + p].style.width = (popuAgeF / max * 100) + '%';

                /*
                 * Bizarrement : Plus lent en temps de calcul mais
                 * plus fluide à l'affichage (sur ipad au moins) !
                 * Mais moins bon support global ....
                 *
                 tabObj['sh' + p].style.webkitTransform =
                 tabObj['sh' + p].style.mozTransform =
                 tabObj['sh' + p].style.webkitTransform =
                 tabObj['sh' + p].style.transform =
                 'scaleX(' + (homme['popu_age' + p] / max) + ')';
                 tabObj['sf' + p].style.webkitTransform = '
                 scaleX(' + (femme['popu_age' + p] / max) + ')';
                 */
                /* tabObj['sh' + p].style.backgroundColor = couleurCode;
                 tabObj['sf' + p].style.backgroundColor = couleurCode;*/
            }
            //}
            previousYear = selectedYear;

            if (callback) {
                callback();
            }
        };
    };


    /*********************************************************************/
    //Gestion des sliders.
    /*********************************************************************/

    /**
     * Génère un jquery-ui slider avec les attributs d'accessibilité "aria".
     */
    function genCustomSlider(element, defaultValue, minValue, maxValue, txtSuffix, sliderClass, slideFunction, slideFunctionInterval, categorie, vertical, purcent, stepVal) {

        var categorie = (categorie) ? categorie : '';
        var txtSuffix = (txtSuffix) ? txtSuffix : '';
        var slideFunction = (slideFunction) ? slideFunction : '';
        var slideOrientation = (vertical) ? "vertical" : 'horizontal';
        var sliderElement = (sliderClass) ? sliderClass : element;
        var trimelement = element.replace("#", "").replace(".", "");
        var count = 0;
        var stepVal = (stepVal) ? stepVal : 0.1;

        //Création du slider.
        /********************************************************************/
        $(element).empty().slider({
            orientation: slideOrientation,
            range: "min",
            animate: true,
            value: defaultValue,
            min: minValue,
            max: maxValue,
            step: stepVal,
            //disabled:true,

            slide: function (event, ui) {
                updateChangeSlide('slide', ui, element, txtSuffix, sliderElement, slideFunction, categorie, purcent, minValue, maxValue, stepVal);
            },
            change: function (event, ui) {
                updateChangeSlide('change', ui, element, txtSuffix, sliderElement, slideFunction, categorie, purcent, minValue, maxValue, stepVal);
            },
            stop: function (event, ui) {
                //updateChangeSlide('stop', ui, element, txtSuffix, sliderElement, slideFunction, categorie, purcent, minValue, maxValue, stepVal);
            }

        });


        //Au chargement du slider.
        /********************************************************************/
        setTimeout(function () {

            //On affiche les valeurs par défaut.
            var slideHandle = $(element + " .ui-slider-handle");

            slideHandle.html('<span class="sliderPointer"></span><span class="sliderValue">' + defaultValue + '</span>' + txtSuffix);
            slideHandle.attr("role", "slider");
            slideHandle.attr("aria-valuenow", defaultValue).attr("aria-valuemin", minValue).attr("aria-valuemax", maxValue);
            slideHandle.attr("aria-valuetext", defaultValue + txtSuffix);

            //On ajoute un wrapper autour du slider.
            $(element).wrap('<div id="' + trimelement + '_wrapper" class="slider_' + slideOrientation + ' slider_wrapper ' + sliderElement.replace(".", "") + '_wrapper"></div>');

            //On ajoute les boutons "+" et "-".
            var prependBtn = (slideOrientation == 'vertical') ? 'more' : 'less';
            $(element + "_wrapper").prepend('<span class="sbutton sbutton_' + prependBtn + '" role="button"></a>');
            var appendBtn = (slideOrientation == 'vertical') ? 'less' : 'more';
            $(element + "_wrapper").append('<span class="sbutton sbutton_' + appendBtn + '" role="button"></a>');

            //On ajoute également dynamiquement les valeurs min et max sous le slider.
            $(element + "_wrapper ").append('<div class="sdefault_values"><div class="sdefault_min">' + minValue + '</div><div class="sdefault_max">' + maxValue + txtSuffix + '</div></div>');

            //Si on souhaite afficher un slider avec les rapports.
            if (purcent) {
                var purcentTab = purcentInto2Numbers(minValue, maxValue, defaultValue, 1);
                //console.log(purcentTab);

                $(slideHandle).hide(); //On masque le curseur.
                var elementWrap = $(element).parent(".slider_wrapper");
                //$(elementWrap).before('<div class="slider_rapports"><div class="slider_rapport_left">Garçons <span>'+purcentTab[0]+' %</span></div><div class="slider_rapport_right"><span>'+purcentTab[1]+' %</span> Filles</div></div>');
                $(elementWrap).before('<div class="slider_rapports"><div class="slider_rapport_left">' + dataTrads[lg]['simulateur_boys'] + ' <span>' + purcentTab[0] + ' %</span></div><div class="slider_rapport_right"><span>' + purcentTab[1] + ' %</span> ' + dataTrads[lg]['simulateur_girls'] + '</div></div>');
            }

        }, 100);

        //Ajout des actions.
        /********************************************************************/
        $(document).on("click", element + "_wrapper .sbutton_more:not(.disabled)", function () {
            var valuenow = $(element).slider("value");
            updateSliders(Number(valuenow) + Number(stepVal), sliderElement);
        });

        $(document).on("click", element + "_wrapper .sbutton_less:not(.disabled)", function () {
            var valuenow = $(element).slider("value");
            updateSliders(Number(valuenow) - Number(stepVal), sliderElement);
        });
    }


    function displaySliders(elements, display) {
        if (display) {
            $(elements).slider("disable");
            $(elements).parent('.slider_wrapper').children('span.sbutton').css({'opacity': 0.35}).addClass('disabled');
        } else {
            $(elements).slider("enable");
            $(elements).parent('.slider_wrapper').children('span.sbutton').css({'opacity': 1}).removeClass('disabled');
        }
    }


    /**
     *On appel cette fonction a chaque fois que l'on influe sur le slider (slide ou change).
     */
    function updateChangeSlide(type, ui, element, txtSuffix, sliderElement, slideFunction, categorie, purcent, minValue, maxValue, stepVal) {
        //console.log(type);

        var slideHandle = $(ui.handle);
        var vlu = slideHandle.find('.sliderValue')[0];
        if (vlu.innerHTML === ui.value) {
            return;
        }

        //On compte les chiffres apr¨s la virgule pour dÃ©finir le nombre de digit.
        var digit = retr_dec(stepVal);

        vlu.innerHTML = formatLgNb(ui.value, digit);

        slideHandle.attr("aria-valuenow", ui.value).attr("aria-valuetext", ui.value + txtSuffix);

        if (type == 'slide') {
            updateSliders(ui.value, sliderElement, element);
        }


        var currentCat = $("#tabs_menu ul li.ui-state-active a").attr("data-categorie");
        //console.log(categorie+' / '+currentCat);
        if (slideFunction && categorie === currentCat /*&& slideFunctionInterval && count == slideFunctionInterval*/) {
            //    console.log(slideFunction);
            //eval(slideFunction + "()");
        }

        if (purcent) {
            //console.log(ui);
            var purcentTab = purcentInto2Numbers(minValue, maxValue, ui.value, 1);
            $('.slider_rapport_left span').html(formatLgNb(Number(purcentTab[0]), digit) + '%');
            $('.slider_rapport_right span').html(formatLgNb(Number(purcentTab[1]), digit) + '%');
        }
    }


    /**
     * On met à jour tous les sliders associés.
     */
    function updateSliders(value, groupElement, currentElement) {
        $(groupElement).not(currentElement).each(function (index) {
            $(this).slider("value", value);
        });
    }


    /*********************************************************************/
    //Gestion des inputs.
    /*********************************************************************/

    //Au clique sur un input +/-.
    $(document).on("click", ".ibutton ", function (e) {

        var ibutton_wrapper_element = $(this).parent('.input_button_wrapper');
        var ibutton_wrapper_element_id = $(ibutton_wrapper_element).attr('id');
        var ibutton_stepval = $(ibutton_wrapper_element).attr('data-stepval');

        if (simulateur_categorie == 'simulateur_libre' && ibutton_wrapper_element_id == 'input_wrapper_annee' && $(this).hasClass('ibutton_less')) {
            return false; //On dÃ©sactive le bouton "-" en simulation libre.
        }

        var ibutton_value_element = $(ibutton_wrapper_element).children('.ivalue');
        var ibutton_value = $(ibutton_value_element).attr('aria-valuenow');
        //var ibutton_value_min = (simulateur_categorie == 'simulateur_libre') ? $(ibutton_value_element).attr('aria-valuemin') : 0;
        var ibutton_value_min = (simulateur_categorie == 'simulateur_onu' && ibutton_wrapper_element_id == 'input_wrapper_annee') ? 1950 : $(ibutton_value_element).attr('aria-valuemin');
        var ibutton_value_max = $(ibutton_value_element).attr('aria-valuemax');
        var ibutton_ecart = $(ibutton_value_element).data('gap');

        var newValue = ($(this).hasClass('ibutton_more')) ? (Number(ibutton_value) + Number(ibutton_ecart)) : (Number(ibutton_value) - Number(ibutton_ecart));
        newValue = newValue.toFixed(1).replace(".0", "").replace(",0", "");

        //On compte les chiffres aprÃ¨s la virgule pour dÃ©finir le nombre de digit.
        var digit = retr_dec(ibutton_stepval);

        if (newValue <= ibutton_value_max && newValue >= ibutton_value_min) {
            $(ibutton_value_element).html(formatLgNb(Number(newValue), digit));
            $(ibutton_value_element).attr('aria-valuenow', newValue);

            if ($(ibutton_wrapper_element).attr('id') == 'input_wrapper_annee') {
                updatePyramid();
            }
        }

        setInputBtnOpacity(ibutton_value_element, ibutton_value, ibutton_value_min, ibutton_value_max);
        if (simulateur_categorie == 'simulateur_libre') {
            $('#input_wrapper_annee').children('.ibutton_less').css({'opacity': '0.5'});
        }
    });


    function setInputBtnOpacity(element, value, minVal, maxVal) {

        var ibutton_value = (value) ? value : $(element).attr('aria-valuenow');
        var ibutton_value_min = (typeof minVal != 'undefined') ? minVal : $(element).attr('aria-valuemin');
        var ibutton_value_max = (typeof maxVal != 'undefined') ? maxVal : $(element).attr('aria-valuemax');

        //On modifie l'opacitÃ© des boutons selon leur disponibilitÃ©.
        ibutton_value = $(element).attr('aria-valuenow');
        var opacity_less = (ibutton_value > ibutton_value_min) ? 1 : 0.5;
        var opacity_more = (ibutton_value < ibutton_value_max) ? 1 : 0.5;

        $(element).parent('.input_button_wrapper').children('.ibutton_less').css({'opacity': opacity_less});
        $(element).parent('.input_button_wrapper').children('.ibutton_more').css({'opacity': opacity_more});
    }


    /*********************************************************************/
    //Gestion des traductions.
    /*********************************************************************/

    /*function t(id){

     var lg = getParam("lang") ? getParam("lang") : "fr";
     return dataTrads[id][lg];
     }*/


    /*********************************************************************/
    //Gestion de la courbe.
    /*********************************************************************/

    //console.log(dataZoneSim);

    $('#simulateur_droite_courbe .courbe_graphique').hide();
    $(document).on("click", ".courbe_titre ", function (e) {

        var graphiqueCourbe = $(this).next('.courbe_graphique');

        if ($(graphiqueCourbe).is(':visible')) {
            $(this).css({'background-image': 'url("./img/picto_bottom.png")'});
            //$(graphiqueCourbe).slideUp();
            $(graphiqueCourbe).hide();
        } else {
            $(this).css({'background-image': 'url("./img/picto_top.png")'});
            //$(graphiqueCourbe).slideDown(function(){};
            $(graphiqueCourbe).show();
            getCourbes(simulateur_categorie);
        }

    });


    /**
     * On rÃ©cupÃ¨re les infos et on affiche la courbe.
     */
    function getCourbes(categorie) {


        //Construction du tableau de donnÃ©es intÃ©ressantes.
        /************************************************************************************/

        var selectedYear = $('#input_simulateur_annee').attr('aria-valuenow');
        var tabDonneesZone = {};
        tabDonneesZone['fk_pays_id'] = [];
        tabDonneesZone['labels'] = [];
        tabDonneesZone['values'] = [];

        //console.log(dataZoneSimLibre);
        switch (categorie) {
            case 'simulateur_onu':

                var limitYear = (selectedYear < currentYear) ? 1950 : currentYear;
                for (keyYear in dataZoneSim) {

                    //if(keyYear >= currentYear){
                    if (keyYear >= limitYear) {

                        //if(keyYear == currentYear){
                        if (tabDonneesZone['fk_pays_id'].length <= 0) {
                            tabDonneesZone['fk_pays_id'] = dataZoneSim[keyYear]['Male']['fk_pays_id'];
                        }

                        if (keyYear <= selectedYear) {
                            tabDonneesZone['values'].push(dataZoneSim[keyYear]['popu_total'] / 1000);
                        }

                        tabDonneesZone['labels'].push(keyYear);
                    }
                }
                break;

            case 'simulateur_libre':

                //console.log(dataZoneSimLibre['popu_total']);
                for (keyYear in dataZoneSimLibre['popu_total']) {

                    //if(keyYear >= currentYear){
                    if (keyYear >= minYearLibreCourbe) {

                        if (tabDonneesZone['fk_pays_id'].length <= 0) {
                            tabDonneesZone['fk_pays_id'] = dataZoneSimLibre['Male']['fk_pays_id'];
                        }

                        if (keyYear <= selectedYear) {
                            tabDonneesZone['values'].push(dataZoneSimLibre['popu_total'][keyYear] / 10);
                        }
                        //tabDonneesZone['labels'].push(keyYear);
                    }

                    if (keyYear > maxYearLibreCourbe) {
                        minYearLibreCourbe = Number(minYearLibreCourbe) + 100;
                        maxYearLibreCourbe = Number(maxYearLibreCourbe) + 100;
                    }
                }

                for (var ky = minYearLibreCourbe; ky <= maxYearLibreCourbe; ky++) {
                    tabDonneesZone['labels'].push(ky);
                }
                break;
        }
        //console.log(tabDonneesZone);


        //On rÃ©cupÃ©rer ensuite les donnÃ©es Ã  intÃ©grer au graphique.
        /************************************************************************************/

        var zones = {};
        var labels = tabDonneesZone['labels'];
        zones['zone1'] = tabDonneesZone['values'];

        //Si on a qu'une seule valeur, on duplique la premiÃ¨re pour Ã©viter les erreurs et afficher quelquechose.
        if (tabDonneesZone['values'].length == 1) {
            zones['zone1'].push(tabDonneesZone['values'][0]);
        }


        //CrÃ©ation du graphique.
        /************************************************************************************/

        //Calcul de la valeur maximale/minimale de la courbe.
        var maxZones = Math.max.apply(Math, zones["zone1"]);
        var minZones = Math.min.apply(Math, zones["zone1"]);

        //Les options du chart.js.
        var lineChartData = {
            labels: labels,
            datasets: []
        };

        //On ajoute les datasets en fonction des zones sÃ©lectionnÃ©es.
        if (zones["zone1"] != null) {

            var idZone = tabDonneesZone['fk_pays_id'];
            var labelZone = $('#form_choix_zone select').find('option[value="' + idZone + '"]').html();
            //console.log(labelZone);

            var zone1 = {
                label: labelZone,
                fillColor: "rgba(34,46,59,0.1)",
                strokeColor: "rgba(34,46,59,1)",
                pointColor: "rgba(34,46,59,1)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(220,220,220,1)",
                data: zones["zone1"]
                //data: [65, 59, 80, 81, 56, 55, 40]
            };
            lineChartData['datasets'].push(zone1);
        }
        //console.log(lineChartData);


        //On recrÃ©er le canvas dynamiquement au cas ou...
        var newCanvas = $('<canvas/>', {'class': 'cnvsClass'}, {'id': 'lineCanvas'}).width(260).height(150);
        $("#simulateur_droite_courbe #wrapperCanvas").html(newCanvas);
        $("#simulateur_droite_courbe #wrapperCanvas").prepend('<div class="courbe_echelle">' + dataTrads[lg]['sim_millions'] + '</div>');

        var ctx = newCanvas[0].getContext('2d');
        //ctx.canvas.width = 260;
        //ctx.canvas.height = 150;
        ctx.canvas.width = $('#wrapperCanvas').width();
        ctx.canvas.height = $('#wrapperCanvas').height();


        //On dÃ©fini le step et la valeur de dÃ©part en fonction de la valeur minimum rÃ©cupÃ©rÃ©e.
        if (minZones < 0) {
            var scaleStepWidthValue = Math.ceil((maxZones - minZones) / 2);
            var scaleStartValue = minZones;
        } else {
            var scaleStepWidthValue = Math.ceil(maxZones / 2);
            var scaleStartValue = 0;
        }


        //var ctx = document.getElementById("lineCanvas").getContext("2d");
        var myLineChart = new Chart(ctx).Line(lineChartData, {
            //responsive: true, //Si on le mets Ã  "true" Ã§a gÃ©nÃ¨re une erreur donc on fait autrement.
            //tooltipXPadding: 60,
            animation: false,
            pointDot: false,
            pointHitDetectionRadius: 0,
            showXLabels: 6,
            datasetStrokeWidth: 2,

            showTooltips: false,

            //scaleLabel: "<%=value%>",
            scaleLabel: function (e) {
                return ' ' + formatNb(e.value);
            },

            // Boolean - If we want to override with a hard coded scale
            scaleOverride: true,

            // ** Required if scaleOverride is true **
            // Number - The number of steps in a hard coded scale
            scaleSteps: 2,
            // Number - The value jump in the hard coded scale
            scaleStepWidth: roundSup(scaleStepWidthValue),
            // Number - The scale starting value
            scaleStartValue: scaleStartValue

        });


        /*

        //On rÃ©cupÃ¨re les donnÃ©es du point de l'annÃ©e actuelle.
        var getSubItem = function (subItems, id) {
         if (subItems) {
             for (var i = 0; i < subItems.length; i++) {
                 if (subItems[i].label == id) {
                     return subItems[i];
                 }
                 var found = getSubItem(subItems[i].items, id);
                 if (found) return found;
             }
         }
     };

     var allPoints = myLineChart.datasets[0]['points'];
     var currentYearPoint = getSubItem(allPoints, currentYear);

        //On positionne par dÃ©faut les lignes sur l'annÃ©e courante.
        $('#yearLine').css({'left':currentYearPoint['x']+'px'}).hide();
        $('#yearLineCurrent').css({'left':currentYearPoint['x']+'px'});



        //On ajuste la largeur de la div '#wrapperInfosCanvas' Ã  la taille du graphique.
        var xPointMin = allPoints.reduce(function(min, arr) {
         return Math.min(min, arr['x']);
     }, +Infinity);

        var xPointMax = allPoints.reduce(function(max, arr) {
         return Math.max(max, arr['x']);
     }, -Infinity);

     var widthCharArea = parseInt(xPointMax) - parseInt(xPointMin);
     var widthDiff = newCanvas.width() - widthCharArea;
     //console.log(widthDiff);

     $('#wrapperInfosCanvas').css({'width':(newCanvas.width()-widthDiff)+'px','padding-left':widthDiff+'px'});
     $('#wrapperDeadZoneCanvas').css({'width':widthDiff+'px', 'height':newCanvas.height()+'px'});


        */

    }

});

/*********************************************************************/
//Autres fonctions.
/*********************************************************************/

function updateSlidersToDatas(selectedYear) {

    //On update les diffÃ©rents sliders.
    var sliderEsperanceVal = dataZoneSim[selectedYear]['Male']['donnee_esperance'];
    var sliderEnfantFemmeVal = dataZoneSim[selectedYear]['Male']['donnee_enfant_femme'];
    $("#slider_simulateur_esperance_vie").slider("value", sliderEsperanceVal);
    $("#slider_simulateur_enfant_femme").slider("value", sliderEnfantFemmeVal);

    /*
    var popuTotal = dataZoneSim[selectedYear]['popu_total'];
    var popuMale = dataZoneSim[selectedYear]['Male']['popu_total'];
    var sliderPurcentMale = popuMale*100/popuTotal;
    $("#slider_simulateur_garcons_filles").slider("value", sliderPurcentMale);
    */

    var popuMale = dataZoneSim[selectedYear]['Male']['popu_age0'];
    var popuFemale = dataZoneSim[selectedYear]['Female']['popu_age0'];
    var popuTotal = Number(popuMale) + Number(popuFemale);
    var sliderPurcentMale = popuMale * 100 / popuTotal;


    //console.log(dataZoneSim[sliderPurcentMale]);
    $("#slider_simulateur_garcons_filles").slider("value", sliderPurcentMale);
}


/**
 * Recupere la valeur d'un parametre defini dans l'url.
 */
function getParam(param) {

    //On separe la chaine des parametres en fonction du &.
    var spath = window.location.search.split("&"), i;
    //Bouclage des parametres.
    for (i = 0; i < spath.length; ++i) {

        hash = spath[i].split("=");
        hash_param = hash[0].replace("?", "");
        hash_val = hash[1];
        //On recupere le parametre de l'url si il existe.
        if (hash_param == param) {
            return hash_val;
        }
    }
}


function getTabActive() {
    return $("#tabs_menu li.ui-tabs-active a").attr('data-categorie');
}


/**
 * Transforme un nom de fichier pour qu'il soit propre.
 */
function niceName(str) {
    str = str.toLowerCase();
    //On remplace les caractÃ¨res accentuÃ©s.
    var rules = {
        a: "Ã Ã¡Ã¢Ã£Ã¤Ã¥",
        e: "Ã¨Ã©ÃªÃ«",
        i: "Ã¬Ã­Ã®Ã¯",
        o: "Ã²Ã³Ã´ÃµÃ¶Ã¸",
        u: "Ã¹ÃºÃ»Ã¼",
        y: "Ã¿",
        c: "Ã§",
        n: "Ã±"
    };
    var regstring = "";
    for (acc in rules) {
        regstring += rules[acc];
    }

    var reg = new RegExp("[" + regstring + "]", "g");
    str = str.replace(reg, function (t) {
        for (acc in rules) {
            if (rules[acc].indexOf(t) > -1) {
                return acc;
            }
        }
    });
    //On remplace les autres caractÃ¨res spÃ©ciaux par un tiret.
    str = $.trim(str);
    str = str.replace(/([^a-z0-9_]+)/g, "-");
    str = str.replace(/-/g, "-");
    str = str.replace(/---/g, "-");
    str = str.replace(/--/g, "-");
    str = $.trim(str);
    return str;
}


/**
 * Permet de reformater les nombres avec des espaces.
 */
function formatNb(nStr) {
    nStr += '';
    var x = nStr.split('.');
    var x1 = x[0];
    var x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ' ' + '$2');
    }

    var niceNb = x1 + x2;
    niceNb = (lg == 'en') ? niceNb : niceNb.replace('.', ',');
    return niceNb;
}


/**
 * Retourne le nombre avec un point ou une virgule en fonction de la langue.
 */
function formatLgNb(nbr, digit) {
    var digit = (digit) ? digit : 0;
    var niceNb = nbr.toFixed(digit);

    niceNb = (lg == 'en') ? niceNb : niceNb.toString().replace('.', ',');
    return niceNb;
    //return niceNb.replace(".0","").replace(",0","");
}


/**
 * On arrondi Ã  la dizaine, centaine, millier, etc supÃ©rieure.
 * @param {Object} n
 */
function roundSup(n) {

    n = Math.ceil(n);
    var countc = n.toString().length;
    var multiple = 1;
    for (i = 1; i < countc; i++) {
        multiple = multiple * 10;
    }

    n = n / multiple;
    n = Math.ceil(n);
    n = n * multiple;
    return n;
}


/**
 * Get decimal portion of a number.
 */
function retr_dec(number) {
    return (number.toString().split('.')[1] || []).length;
}


/**
 * Pour un arrondi spÃ©cifique.
 * @param {Object} n
 */
function myToFixed(n, digits) {
    digits = digits || 0;
    return n.toFixed(digits).replace(new RegExp("\\.0{" + digits + "}"), "");
}


function purcentInto2Numbers(minValue, maxValue, defaultValue, digits) {

    var digits = (digits) ? digits : 2;
    var maxTemp = maxValue - minValue;
    var defaultTemp = defaultValue - minValue;
    var purcent1 = (defaultTemp * 100) / maxTemp;
    var purcent2 = 100 - purcent1;

    //return [Math.round(purcent1), Math.round(purcent2)];
    return [myToFixed(purcent1, digits), myToFixed(purcent2, digits)];
}
