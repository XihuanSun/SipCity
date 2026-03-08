# SipCity
AI-powered cocktail discovery assistant.

## Team Members
- Yingyun Zhan
- Yifan Wang
- Zhirui Wang
- Xihuan Sun

# SipCity

AI-powered cocktail discovery assistant built for real-world cocktail exploration.

SipCity helps users identify and explore cocktails from a single drink photo. By combining AI vision analysis with user-selected flavor cues, the system recommends similar cocktails and provides step-by-step recipes.

---

# Demo

## Product Demo (Screen Recording)



---

# Workflow

<img width="668" height="966" alt="SipCity Workflow" src="https://github.com/user-attachments/assets/ca510c90-c49f-4903-857e-9e864266f381" />

The system converts a drink image into cocktail recommendations using a multi-step AI pipeline.

---

# Overview

SipCity is an AI-powered discovery assistant designed for New York cocktail culture scenarios.

Users upload a drink photo and select taste cues such as sour, sweet, bitter, strong, or refreshing. Based on the image and those cues, the system analyzes possible ingredients and flavor signals, then recommends three related cocktails.

Instead of searching menus or websites, users can explore cocktails instantly from a single image.

---

# Problem

When people see an interesting cocktail, they often do not know:

• what ingredients might be in the drink  
• what similar cocktails they should explore next  

Existing information is scattered across menus and websites, making the experience fragmented and unintuitive.

---

# Solution

SipCity turns one drink photo into a cocktail discovery journey.

Using AI vision analysis and flavor cues, the system identifies drink characteristics and suggests cocktails with similar structures. Users can then explore recipes and learn how to recreate the drink.

---

# Key Features

• Upload cocktail images  
• Select taste cues (sweet, sour, bitter, strong, refreshing)  
• AI image analysis for ingredients and drink signals  
• Top 3 cocktail recommendations  
• Step-by-step cocktail recipes  
• Interactive feedback loop to refine results  

---

# How It Works

1. User uploads a drink image
2. User selects flavor cues
3. AI vision model analyzes drink signals
4. Matching engine compares signals with cocktail library
5. System returns top 3 cocktails
6. User selects the closest match
7. Recipe and explanation are generated

---

# Tech Stack

Frontend  
Electron

Backend  
Node.js

AI Model  
Gemini 2.5

AI Tools  
Transformers.js

Logic  
Rule-based cocktail recommendation engine

---

# Project Structure

sipcity
│
├── README.md
├── workflow.png
├── demo.gif
│
├── images
│   ├── upload.png
│   ├── recommendations.png
│   └── recipe.png
│
├── main.js
├── renderer.js
├── index.html
└── package.json

---

# Installation

Clone the repository

git clone https://github.com/XihuanSun/sipcity

Install dependencies

npm install

Run the project

npm start

---
