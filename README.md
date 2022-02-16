# automated-image-anchor-alignment

## Introduction
Early stage of a image alignment programmed based on classified images with automatically detected patterns.

The program is based on the use of python scripts for pattern recognition and generates dataframe which describes the images.
This dataframe is then used to generate a **descriptor__file.txt**, containing image filename in a desired order, along with in an anchor point where they ought to be aligned.

descriptor\_file.txt example
```
filename|x,y
img_153.jpg|134,242
img_301.jpg|116,76
img_1875.jpg|192,118
img_1459.jpg|174,100
img_371.jpg|174,68
img_892.jpg|50,100
```

The file is then used to feed a JavaScript **script.jsx** which commands Adobe After Effect to effectively align the images.

## Installation

This phase is not an installation per se considering the early stage of the project.

Nevertheless in order to run smoothly accross different platform we recommend using a conda environment before running the scripts

First off install miniconda on your system using the proper installer:

https://docs.conda.io/en/latest/miniconda.html

Then set up the environment

```
conda env create -f environment.yml
```

note : the conda environment is name anchor\_ali, this is already specified in the environment.yml file


You can then activate the environment to start running the scripts

```
conda activate anchor_ali
```

## Running the programs

Considering the program the python effective part is located in a jupyter notebook

In order to run jupyter, __once you have activated the environment__ run a jupyter lab in the current folder

```
jupyter lab
```

then open the jupyter notebook and explore
