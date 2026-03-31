# Experimental Implementation Sample

Online implementation of a reading-by-rotating paradigm with custom interaction plugin and R-based analysis

## Overview
This repository contains an online implementation of a behavioral experiment based on a *reading-by-rotating* paradigm.

The paradigm translates a physical interaction (rotating a knob during reading) into a browser-based setting, allowing participants to control stimulus presentation via rotational input.

The project demonstrates the full experimental pipeline, including experiment implementation, custom interaction design, data collection, and statistical analysis.

## My Contribution
I developed and structured the experiment end-to-end, including:
- translating a physical experimental paradigm into an online interaction
- implementing trial logic and participant flow
- handling stimulus presentation and item structure
- developing and integrating a custom jsPsych plugin for rotational input
- implementing server-side data collection (PHP)
- performing data preprocessing and statistical analysis in R

## Tech Stack
- JavaScript / HTML (experiment implementation)
- PHP (data handling)
- R (data analysis)

## Project Structure
- `index.html` - entry point of the experiment  
- `experiment.js` - main experiment logic  
- `items.js` - experimental items and conditions  
- `write_data.php` - server-side data storage  
- `consent_deutsch_prolific.html` - consent form  

- `custom_jspsych_plugins/` - custom-developed plugin components  
- `assets/images/` - visual stimuli
- `analysis/analysis.R` - analysis script  
- `analysis/figures/` - selected output figures  

## Custom Interaction
The repository includes a custom jsPsych plugin (`reading-by-rotating`) implementing a continuous rotational input mechanism.

This component enables the online realization of a *reading-by-rotating* paradigm, adapting a classic experimental setup (related to Action-Sentence Compatibility Effect paradigms) to a web-based environment.

## Data and Analysis
The `analysis/analysis.R` script contains the data processing and statistical analysis used to evaluate the experimental results.

Example output figures are included in `analysis/figures/`.

## Notes
This repository contains a curated subset of a larger project.  
Experimental data are not included for privacy and ethical reasons.


## Try the Experiment

You can try the experiment online here:
https://www.sprachexperimente.psychologie.uni-tuebingen.de/online_knob5/index.html