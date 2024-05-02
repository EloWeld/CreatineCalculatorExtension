// App state
let resultsCalculated = localStorage.getItem('calcResult');
let starsClicked = localStorage.getItem('stars_clicked');

export const state = {
    sex: null,
    race: null,
    resultMode: "gault",
    lastResult: null,
    has_result: false,
    lastResultsList: [],
    resultsCalculated: resultsCalculated ? parseInt(resultsCalculated, 10) : 0,
    starsClicked: starsClicked === "true",
    lastTimeStarsViewed: parseInt(localStorage.getItem('lastTimeStarsViewed'), 10) || 0
};

export const results_desc_text = document.getElementById("result-box");


// Constants for elements
export const inputs = {
    age: document.getElementById("age_input"),
    weight: document.getElementById("weight_input"),
    height: document.getElementById("height_input"),
    cystatin: document.getElementById("serum_cystatin_input"),
    creatinine: document.getElementById("serum_creatinine_input"),
    resultsText: document.getElementById("result-box")
};

export const unitElements = {
    weight: document.getElementById("weight_units"),
    height: document.getElementById("height_units"),
    creatinine: document.getElementById("creatinine_units")
};

export const modeButtons = {
    gault: document.getElementById("radio_mode_gault"),
    mdrd: document.getElementById("radio_mode_mdrd"),
    ckd: document.getElementById("radio_mode_ckd")
};

export const rg_sex = document.getElementById("radio_group_sex");
export const sexButtons = {
    female: document.getElementById("radio_female"),
    male: document.getElementById("radio_male")
};

export const rg_race = document.getElementById("radio_group_black_race");
export const raceButtons = {
    yes: document.getElementById("radio_yes"),
    no: document.getElementById("radio_no")
};

export const actionButtons = {
    clear: document.getElementById("clear_results_btn"),
    copy: document.getElementById("copy_results_btn")
};

export const separators = {
    sex: document.getElementById("sex_separator"),
    race: document.getElementById("black_race_separator"),
    mode: [
        document.getElementById("mode_separator1"),
        document.getElementById("mode_separator2"),
    ]
};
