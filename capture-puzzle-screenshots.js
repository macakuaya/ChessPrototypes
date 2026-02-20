#!/usr/bin/env node

/**
 * Script to capture screenshots of the puzzle app in solved state
 * Shows the video card with "Watch Video" button
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function capturePuzzleScreenshots() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: true, // Run in headless mode
    defaultViewport: {
      width: 1920,
      height: 1080
    },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  let page;
  try {
    page = await browser.newPage();
    
    // Navigate to the puzzle app
    console.log('Navigating to puzzle app...');
    await page.goto('http://localhost:5174/ChessPrototypes/new-daily-puzzle/', {
      waitUntil: 'networkidle0'
    });
    
    // Wait a moment for the page to fully render
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Take initial screenshot
    console.log('Taking initial screenshot...');
    await page.screenshot({
      path: 'puzzle-initial.png',
      fullPage: true
    });
    console.log('✓ Saved: puzzle-initial.png');
    
    // Look for and click the Start button
    console.log('Looking for Start button...');
    const startButton = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(btn => btn.textContent.includes('Start') || btn.textContent.includes('Solve'));
    });
    
    if (startButton && startButton.asElement()) {
      console.log('Clicking Start button...');
      await startButton.asElement().click();
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Look for Hint button to trigger the Solution button
    console.log('Looking for Hint button...');
    const hintButton = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(btn => btn.textContent.includes('Hint'));
    });
    
    if (hintButton && hintButton.asElement()) {
      console.log('Clicking Hint button...');
      await hintButton.asElement().click();
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Look for and click Solution button
    console.log('Looking for Solution button...');
    const solutionButton = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(btn => btn.textContent.includes('Solution'));
    });
    
    if (solutionButton && solutionButton.asElement()) {
      console.log('Clicking Solution button...');
      await solutionButton.asElement().click();
      
      // Wait for puzzle to auto-solve (animations take time)
      console.log('Waiting for puzzle to complete...');
      await new Promise(resolve => setTimeout(resolve, 6000)); // Wait for all animations
      
      // Wait for the "Puzzle Complete" button or solved state
      await page.evaluateHandle(() => {
        return new Promise((resolve) => {
          const checkForComplete = () => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const completeBtn = buttons.find(btn => btn.textContent.includes('Puzzle Complete'));
            if (completeBtn) resolve(completeBtn);
            else setTimeout(checkForComplete, 100);
          };
          checkForComplete();
          setTimeout(() => resolve(null), 10000); // Timeout after 10s
        });
      }).catch(() => {
        console.log('Note: Puzzle Complete button not found, continuing anyway...');
      });
      
      // Take screenshot of solved state
      console.log('Taking solved state screenshot...');
      await page.screenshot({
        path: 'puzzle-solved.png',
        fullPage: true
      });
      console.log('✓ Saved: puzzle-solved.png');
      
      // Try to capture just the video card area
      const videoCard = await page.$('.video-card, [class*="video"]').catch(() => null);
      if (videoCard) {
        console.log('Taking video card screenshot...');
        await videoCard.screenshot({
          path: 'puzzle-video-card.png'
        });
        console.log('✓ Saved: puzzle-video-card.png');
      }
    } else {
      console.log('Solution button not found. Taking current state screenshot...');
      await page.screenshot({
        path: 'puzzle-current-state.png',
        fullPage: true
      });
      console.log('✓ Saved: puzzle-current-state.png');
    }
    
    console.log('\n✓ All screenshots captured successfully!');
    console.log('Screenshots saved in:', process.cwd());
    
  } catch (error) {
    console.error('Error:', error.message);
    
    // Take error screenshot
    try {
      const page = (await browser.pages())[0];
      await page.screenshot({
        path: 'puzzle-error.png',
        fullPage: true
      });
      console.log('✓ Saved error screenshot: puzzle-error.png');
    } catch (e) {
      // Ignore screenshot error
    }
  } finally {
    await browser.close();
  }
}

// Run the script
capturePuzzleScreenshots().catch(console.error);
