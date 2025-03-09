let currentScroll = 0;
let pageFlow = 0;
let currentPage = 1;
let scrollTimeout;
let currentlyTransitioning = 0;
let startingPage = true;
let lastPage = false;

const squareScale = d3.scaleLinear().domain([0, 100]).range([0, 600]).clamp(true).interpolate((a, b) => (t) => a + (b - a) * t * t);

window.onload = function() {
    activateScroll();
    decreaseInterval();
};

function updateScroll() {
    const scrolled = this.scrollTop;

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
        if (!startingPage) {
            currentScroll = scrolled;
            pageFlow -= 3;
            moveDown(currentPage);

            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                increaseInterval();
            }, 100);
        }
    }

    if (lastPage) {
        this.scrollTop = currentScroll;
        return
    }

    if (startingPage) {
        this.scrollTop = currentScroll;
        return
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
    overlay.node().scrollTo(0, 10000);
    overlay.on('scroll', updateScroll);
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
        pageFlow = 0;
    }

    firstLast();
}

function easeInPage(pageNum) {
    if (currentlyTransitioning === 1) {
        displayPage(pageNum);
        const page = d3.select(`#page${pageNum}`);
        let moveFactor = 70;

        page.style('top', '250px');
        const easeIn = setInterval(() => {
            if (page.style('top') === '0px') {
                currentlyTransitioning = 0;
                clearInterval(easeIn);
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

        page.style('top', '-250px');
        const easeIn = setInterval(() => {
            if (page.style('top') === '0px') {
                currentlyTransitioning = 0;
                clearInterval(easeIn);
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