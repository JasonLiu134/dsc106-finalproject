import {changeCorrDisplay} from './corrmatrix.js';
import {createVis} from './barcharts.js';
import {createFinalVis} from './finalvis.js';

let currentScroll = 0;
let pageFlow = 0;
let currentPage = 1;
let scrollTimeout;
let currentlyTransitioning = 0;
let startingPage = true;
let lastPage = false;
let transitional = 0;
let currentScrollState = 1;
let lastPageUpdate = 0;

const squareScale = d3.scaleLinear().domain([0, 100]).range([0, 600]).clamp(true).interpolate((a, b) => (t) => a + (b - a) * t * t);
const squareScaleSmall = d3.scaleLinear().domain([0, 50]).range([0, 300]).clamp(true).interpolate((a, b) => (t) => a + (b - a) * t * t);
const scrollStates = [0, 4, 2, 1, 1];
const bgcolors = ['blank', 'lavender', 'honeydew', 'papayawhip', 'whitesmoke'];

window.onload = function() {
    activateScroll();
    decreaseInterval();
};

function updateScrollController() {
    const scrolled = this.scrollTop;

    if (transitional != 0) {
        if (transitional === 1) {
            if (scrolled > currentScroll) {
                if (!lastPage) {
                    currentScroll = scrolled;
                    pageFlow += 3;
                    moveUp(currentPage);
        
                    clearTimeout(scrollTimeout);
                    scrollTimeout = setTimeout(() => {
                        decreaseInterval();
                    }, 100);
                }
            } else if (scrolled < currentScroll) {
                transitional = 0;
            }
        } else if (transitional === -1) {
            if (scrolled < currentScroll) {
                if (!startingPage) {
                    currentScroll = scrolled;
                    pageFlow -= 3;
                    moveDown(currentPage);
        
                    clearTimeout(scrollTimeout);
                    scrollTimeout = setTimeout(() => {
                        increaseInterval();
                    }, 100);
                }
            } else if (scrolled > currentScroll) {
                transitional = 0;
            }
        }
    
        if (lastPage) {
            this.scrollTop = currentScroll;
        }
    
        if (startingPage) {
            this.scrollTop = currentScroll;
        }
    } else {
        const now = Date.now();
        if (now - lastPageUpdate >= 700) {
            lastPageUpdate = now;
            updateScrollDisplay(scrolled);
        }
        currentScroll = scrolled;
    }
}

function updateScrollDisplay(scrolled) {
    if (scrolled > currentScroll) {
        increaseScrollState();
    } else if (scrolled < currentScroll) {
        decreaseScrollState();
    }
}

function increaseScrollState() {
    if (currentScrollState < scrollStates[currentPage]) {
        currentScrollState += 1;
        transitional = 0;
        changePageState('down');
    } else if (currentScrollState === scrollStates[currentPage]) {
        if (!lastPage) {
            transitional = 1;
        }
    }
}

function decreaseScrollState() {
    if (currentScrollState > 1) {
        currentScrollState -= 1;
        transitional = 0;
        changePageState('up');
    } else if (currentScrollState === 1) {
        if (!startingPage) {
            transitional = -1;
        }
    }
}

function decreaseInterval() {
    const dec = setInterval(() => {
        if (pageFlow <= 0) {
            clearInterval(dec);
        } else {
            pageFlow -= 0.2;
            moveUp(currentPage);
        }
    }, 1); 
}

function increaseInterval() {
    const inc = setInterval(() => {
        if (pageFlow >= 0) {
            clearInterval(inc);
        } else {
            pageFlow += 0.2;
            moveDown(currentPage);
        }
    }, 1); 
}

function activateScroll() {
    const overlay = d3.select('.scroll-overlay');
    overlay.node().scrollTo(0, 300000);
    currentScroll = 300000;
    overlay.on('scroll', updateScrollController);
}

function displayPage(pageNum) {
    const page = d3.select(`#page${pageNum}`).style('display', 'block');
}

function hidePage(pageNum) {
    const page = d3.select(`#page${pageNum}`).style('display', 'none');
}

function moveUp(pageNum) {
    if (currentlyTransitioning === 0) {
        const locChange = (squareScale(pageFlow));
        d3.select(`#page${pageNum}`)
        .style('top', `-${locChange}px`)
        .style('opacity', `${100 - (locChange / 600) * 100}%`);
        detectPageChange();
    }
}

function moveDown(pageNum) {
    if (currentlyTransitioning === 0) {
        const locChange = (squareScale(-pageFlow));
        d3.select(`#page${pageNum}`)
        .style('top', `${locChange}px`)
        .style('opacity', `${100 - (locChange / 600) * 100}%`);
        detectPageChange();
    }
}

function detectPageChange() {
    if (pageFlow >= 100) {
        currentlyTransitioning = 1;
        hidePage(currentPage);
        currentPage = currentPage + 1;
        easeInPage(currentPage);
        pageFlow = 0;
    } else if (pageFlow <= -100) {
        currentlyTransitioning = -1;
        hidePage(currentPage);
        currentPage = currentPage - 1;
        easeInPage(currentPage);
    }

    firstLast();
}

function easeInPage(pageNum) {
    if (currentlyTransitioning === 1) {
        displayPage(pageNum);
        const page = d3.select(`#page${pageNum}`);
        let moveFactor = 70;
        activatePageState();

        page.style('top', '250px');
        const easeIn = setInterval(() => {
            if (page.style('top') === '0px') {
                clearInterval(easeIn);
                setTimeout(function() {
                }, 1000);
                currentlyTransitioning = 0;
                pageFlow = 0;
                currentScrollState = 1;
                transitional = 0;
                document.body.style.backgroundColor = bgcolors[currentPage];
            } else {
                moveFactor = moveFactor - 0.4;
                page.style('top', `${squareScale(moveFactor)}px`)
                .style('opacity', `${100 - moveFactor}%`);
            }
        }, 1); 
    } else if (currentlyTransitioning === -1) {
        displayPage(pageNum);
        const page = d3.select(`#page${pageNum}`);
        let moveFactor = 70;
        activatePageState();

        page.style('top', '-250px');
        const easeIn = setInterval(() => {
            if (page.style('top') === '0px') {
                clearInterval(easeIn);
                setTimeout(function() {
                }, 1000);
                currentlyTransitioning = 0;
                pageFlow = 0;
                currentScrollState = scrollStates[currentPage];
                transitional = 0;
                document.body.style.backgroundColor = bgcolors[currentPage];
            } else {
                moveFactor = moveFactor - 0.4;
                page.style('top', `-${squareScale(moveFactor)}px`)
                .style('opacity', `${100 - moveFactor}%`);
            }
        }, 1); 
    }
}

function firstLast() {
    if (currentPage === 1) {
        startingPage = true;
    } else {
        startingPage = false;
    }

    if (currentPage === 4) {
        lastPage = true;
    } else {
        lastPage = false;
    }
}

function changePageState(mode) {
    if (currentPage === 1) {
        if (currentScrollState === 1) {
            const fadeIn = d3.select(`#page1 .caption1`);
            if (mode === 'down') {
                const fadeOut = d3.select(`#page1 .caption2`);
                fadeInOut(fadeIn, fadeOut);
            } else if (mode === 'up') {
                const fadeOut = d3.select(`#page1 .caption2`);
                fadeOutIn(fadeIn, fadeOut);
            }
            changeCorrDisplay(1);
        }

        if (currentScrollState === 2) {
            const fadeIn = d3.select(`#page1 .caption2`);
            if (mode === 'down') {
                const fadeOut = d3.select(`#page1 .caption1`);
                fadeInOut(fadeIn, fadeOut);
            } else if (mode === 'up') {
                const fadeOut = d3.select(`#page1 .caption3`);
                fadeOutIn(fadeIn, fadeOut);
            }
            changeCorrDisplay(2);
        }

        if (currentScrollState === 3) {
            const fadeIn = d3.select(`#page1 .caption3`);
            if (mode === 'down') {
                const fadeOut = d3.select(`#page1 .caption2`);
                fadeInOut(fadeIn, fadeOut);
            } else if (mode === 'up') {
                const fadeOut = d3.select(`#page1 .caption4`);
                fadeOutIn(fadeIn, fadeOut);
            }
            changeCorrDisplay(3);
        }

        if (currentScrollState === 4) {
            const fadeIn = d3.select(`#page1 .caption4`);
            if (mode === 'down') {
                const fadeOut = d3.select(`#page1 .caption3`);
                fadeInOut(fadeIn, fadeOut);
            } else if (mode === 'up') {
                const fadeOut = d3.select(`#page1 .caption3`);
                fadeOutIn(fadeIn, fadeOut);
            }
            changeCorrDisplay(4);
        }
    }

    if (currentPage === 2) {
        if (currentScrollState === 1) {
            const fadeIn = d3.select(`#page2 .caption1`);
            const fadeOut = d3.select(`#page2 .caption2`);
            if (mode === 'down') {
                fadeInOut(fadeIn, fadeOut);
            } else if (mode === 'up') {
                fadeOutIn(fadeIn, fadeOut);
            }
        }

        if (currentScrollState === 2) {
            const fadeIn = d3.select(`#page2 .caption2`);
            const fadeOut = d3.select(`#page2 .caption1`);
            if (mode === 'down') {
                fadeInOut(fadeIn, fadeOut);
            } else if (mode === 'up') {
                fadeOutIn(fadeIn, fadeOut);
            }
        }
    }

    if (currentPage === 3) {
        createVis();
    }

    if (currentPage === 4) {
        createFinalVis();
    }
}

function fadeInOut(fadeIn, fadeOut) {
    fadeIn.style('top', '300px');   
    let moveFactor = 50;
    const ease = setInterval(() => {
        if (fadeIn.style('top') === '0px') {
            fadeOut.style('display', 'none');
            clearInterval(ease);
        } else {
            moveFactor = moveFactor - 0.4;
            fadeIn.style('top', `${squareScaleSmall(moveFactor)}px`)
            .style('opacity', `${100 - moveFactor}%`);
            fadeOut.style('top', `${squareScaleSmall(moveFactor) - 300}px`)
            .style('opacity', `${moveFactor}%`);
        }
    }, 1); 
    fadeIn.style('display', 'block');
}

function fadeOutIn(fadeIn, fadeOut) {
    fadeIn.style('top', '-300px');   
    let moveFactor = 50;
    const ease = setInterval(() => {
        if (fadeIn.style('top') === '0px') {
            fadeOut.style('display', 'none');
            clearInterval(ease);
        } else {
            moveFactor = moveFactor - 0.4;
            fadeIn.style('top', `${-squareScaleSmall(moveFactor)}px`)
            .style('opacity', `${100 - moveFactor}%`);
            fadeOut.style('top', `${-squareScaleSmall(moveFactor) + 300}px`)
            .style('opacity', `${moveFactor}%`);
        }
    }, 1); 
    fadeIn.style('display', 'block');
}

function activatePageState() {
    if (currentPage === 3) {
        createVis();
    }

    if (currentPage === 4) {
        createFinalVis();
    }
}