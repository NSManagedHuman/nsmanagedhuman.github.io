const projects = [
    {
        name: "Work in progress, for now just a lorem ipsum",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas consequat faucibus odio, in dapibus purus tincidunt ut. Donec consectetur commodo lorem, sed tincidunt dui dictum at. Aliquam blandit convallis iaculis. In nunc arcu, convallis eu ex ut, pellentesque laoreet elit."
    }
];

let currentProjectIndex = 0;

// Navigation stack to track screen history
let navigationStack = ['welcomeScreen'];

function typeText(element, text, delay = 20, cursor = null) { // Increased typing speed
    return new Promise((resolve) => {
        let index = 0;
        function addChar() {
            if (index < text.length) {
                // If cursor exists, insert text before it
                if (cursor && cursor.parentNode === element) {
                    const textNode = document.createTextNode(text.charAt(index));
                    element.insertBefore(textNode, cursor);
                } else {
                    element.textContent += text.charAt(index);
                }
                index++;
                setTimeout(addChar, delay);
            } else {
                resolve();
            }
        }
        addChar();
    });
}

let currentTypingCleanup = null;

// Track which screens have been animated
const animatedScreens = {
    welcome: false,
    definition: false
};

function showScreen(screenId) {
    isTypingDefinition = false;

    if (currentTypingCleanup) {
        currentTypingCleanup();
        currentTypingCleanup = null;
    }

    // Hide all screens
    document.querySelectorAll('#welcomeScreen, #definitionScreen, #projectsScreen')
        .forEach(screen => {
            screen.style.display = 'none';
        });

    // Show the target screen
    const targetScreen = document.getElementById(screenId);
    targetScreen.style.display = 'block';

    // Update window title based on screen
    const windowTitle = document.querySelector('.window-title');
    const titles = {
        'welcomeScreen': 'Welcome.swift',
        'definitionScreen': 'About.swift',
        'projectsScreen': 'Projects.swift'
    };
    windowTitle.textContent = titles[screenId] || 'Welcome.swift';

    // Show/hide back button based on screen
    const backButton = document.getElementById('headerBackButton');
    if (screenId === 'welcomeScreen') {
        backButton.style.display = 'none';
    } else {
        backButton.style.display = 'inline-flex';
    }
}

async function typeInitialScreen() {
    // Only animate if not already done
    if (animatedScreens.welcome) {
        // Just show the final state immediately
        const comments = document.querySelectorAll('#welcomeScreen .comment');
        comments[0].textContent = '// Hi';
        comments[1].textContent = '//';
        comments[2].textContent = '// Welcome to dannyharris.eu';
        comments[3].textContent = '//';

        const code = document.querySelector('#welcomeScreen .code');
        code.innerHTML = '<span class="keyword">let</span> <span class="function">me</span> <span class="operator">=</span> <span class="function presentMyself">presentMyself</span><span class="operator">()</span>';

        setupPresentMyselfHandler();
        return;
    }

    // Create cursor
    const cursor = document.createElement('span');
    cursor.className = 'typing-cursor';

    // Animate for the first time
    const comments = document.querySelectorAll('#welcomeScreen .comment');

    // Place cursor at first position and show it during idle time
    comments[0].appendChild(cursor);

    // Add initial idle delay (1-3 seconds) with cursor visible
    const idleDelay = 1000 + Math.random() * 2000;
    await new Promise(resolve => setTimeout(resolve, idleDelay));

    await typeText(comments[0], '// Hi', 20, cursor);
    comments[1].appendChild(cursor);
    await typeText(comments[1], '//', 20, cursor);
    comments[2].appendChild(cursor);
    await typeText(comments[2], '// Welcome to dannyharris.eu', 20, cursor);
    comments[3].appendChild(cursor);
    await typeText(comments[3], '//', 20, cursor);

    // Move cursor to code span before typing it
    const codeSpan = document.querySelector('#welcomeScreen .code');
    codeSpan.appendChild(cursor);

    // Type the code line as plain text
    await typeText(codeSpan, 'let me = presentMyself()', 20, cursor);

    // After typing is complete, remove cursor
    cursor.remove();

    // Then apply syntax highlighting
    codeSpan.innerHTML = '<span class="keyword">let</span> <span class="function">me</span> <span class="operator">=</span> <span class="function presentMyself">presentMyself</span><span class="operator">()</span>';

    setupPresentMyselfHandler();
    animatedScreens.welcome = true;
}

function setupPresentMyselfHandler() {
    // Add click and right-click handlers to presentMyself function
    const presentMyselfElement = document.querySelector('.presentMyself');
    if (presentMyselfElement) {
        // Left click handler
        presentMyselfElement.addEventListener('click', (e) => {
            e.preventDefault();
            showDefinitionBubble(e);
        });

        // Right click handler
        presentMyselfElement.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            showDefinitionBubble(e);
        });
    }
}

let isTypingDefinition = false;

async function typeHTMLContent(element, htmlContent, delay = 15) {
    // Parse HTML to extract text and elements
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const nodes = Array.from(doc.body.childNodes);

    for (const node of nodes) {
        if (node.nodeType === Node.TEXT_NODE) {
            // Type plain text character by character
            for (let i = 0; i < node.textContent.length; i++) {
                const textNode = document.createTextNode(node.textContent[i]);
                element.appendChild(textNode);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            // Create the span element
            const span = document.createElement(node.tagName.toLowerCase());
            span.className = node.className;

            // Copy attributes (for links, etc)
            Array.from(node.attributes).forEach(attr => {
                span.setAttribute(attr.name, attr.value);
            });

            element.appendChild(span);

            // Type the content inside the span character by character
            const content = node.textContent;
            for (let i = 0; i < content.length; i++) {
                span.textContent += content[i];
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
}

async function typeDefinition() {
    if (isTypingDefinition) return;
    isTypingDefinition = true;

    const codeContent = document.getElementById('codeContent');
    codeContent.innerHTML = '';

    const lines = [
        { number: 1, content: 'func presentMyself() -> Developer {', styledContent: '<span class="keyword">func</span> <span class="function">presentMyself</span><span class="operator">() -></span> <span class="function">Developer</span> <span class="operator">{</span>', indent: 0 },
        { number: 2, content: '    Developer(', styledContent: '<span class="function">Developer</span><span class="operator">(</span>', indent: 1 },
        { number: 3, content: '        type: .iOS,', styledContent: '<span class="operator">type: .</span><span class="keyword">iOS</span><span class="operator">,</span>', indent: 2 },
        { number: 4, content: '        name: "Daniel Carrillo Harris",', styledContent: '<span class="operator">name: </span><span class="string">"Daniel Carrillo Harris"</span><span class="operator">,</span>', indent: 2 },
        { number: 5, content: '        workplace: "TUI Group",', styledContent: '<span class="operator">workplace: </span><span class="string">"TUI Group"</span><span class="operator">,</span>', indent: 2 },
        { number: 6, content: '        languages: [.swift, .objc, .bash, .python, .kotlin],', styledContent: '<span class="operator">languages: [.</span><span class="keyword">swift</span><span class="operator">, .</span><span class="keyword">objc</span><span class="operator">, .</span><span class="keyword">bash</span><span class="operator">, .</span><span class="keyword">python</span><span class="operator">, .</span><span class="keyword">kotlin</span><span class="operator">],</span>', indent: 2 },
        { number: 7, content: '        platforms: [.iOS, .iPadOS, .internalTooling],', styledContent: '<span class="operator">platforms: [.</span><span class="keyword">iOS</span><span class="operator">, .</span><span class="keyword">iPadOS</span><span class="operator">, .</span><span class="keyword">internalTooling</span><span class="operator">],</span>', indent: 2 },
        { number: 8, content: '        origin: "Tenerife, 🇮🇨, 🇪🇸",', styledContent: '<span class="operator">origin: </span><span class="string">"Tenerife, 🇮🇨, 🇪🇸"</span><span class="operator">,</span>', indent: 2 },
        { number: 9, content: '        residence: "London, 🏴󠁧󠁢󠁥󠁮󠁧󠁿, 🇬🇧",', styledContent: '<span class="operator">residence: </span><span class="string">"London, 🏴󠁧󠁢󠁥󠁮󠁧󠁿, 🇬🇧"</span><span class="operator">,</span>', indent: 2 },
        { number: 10, content: '        contact: "hello@dannyharris.eu"', styledContent: '<span class="operator">contact: </span><span class="string" id="email"><a class="string" href="mailto:hello@dannyharris.eu">"hello@dannyharris.eu"</a></span>', indent: 2 },
        { number: 11, content: '    )', styledContent: '<span class="operator">)</span>', indent: 1 },
        { number: 12, content: '}', styledContent: '<span class="operator">}</span>', indent: 0 }
    ];

    try {
        // If already animated, show instantly
        if (animatedScreens.definition) {
            for (const line of lines) {
                const lineDiv = document.createElement('div');
                lineDiv.className = 'line';
                const indentSpaces = '&nbsp;'.repeat(line.indent * 4);
                lineDiv.innerHTML = `
                    <div class="line-number">${line.number}</div>
                    <div class="line-content">${indentSpaces}${line.styledContent}</div>
                `;
                codeContent.appendChild(lineDiv);
            }
        } else {
            // Create cursor
            const cursor = document.createElement('span');
            cursor.className = 'typing-cursor';

            // Add initial idle delay (1-3 seconds) with cursor visible
            const firstLineDiv = document.createElement('div');
            firstLineDiv.className = 'line';
            firstLineDiv.innerHTML = `
                <div class="line-number">1</div>
                <div class="line-content"></div>
            `;
            codeContent.appendChild(firstLineDiv);
            const firstLineContent = firstLineDiv.querySelector('.line-content');
            firstLineContent.appendChild(cursor);

            const idleDelay = 1000 + Math.random() * 2000;
            await new Promise(resolve => setTimeout(resolve, idleDelay));

            // Animate for the first time
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                let lineDiv, lineContent;

                if (i === 0) {
                    // First line already exists
                    lineDiv = firstLineDiv;
                    lineContent = firstLineContent;
                } else {
                    // Create new line
                    lineDiv = document.createElement('div');
                    lineDiv.className = 'line';
                    lineDiv.innerHTML = `
                        <div class="line-number">${line.number}</div>
                        <div class="line-content"></div>
                    `;
                    codeContent.appendChild(lineDiv);
                    lineContent = lineDiv.querySelector('.line-content');
                    lineContent.appendChild(cursor);
                }

                // Type the plain text
                await typeText(lineContent, line.content, 15, cursor);

                // Apply syntax highlighting with indentation
                const indentSpaces = '&nbsp;'.repeat(line.indent * 4);
                lineContent.innerHTML = indentSpaces + line.styledContent;

                // Move cursor to next line if not the last line
                if (i < lines.length - 1) {
                    // Cursor will be added to the next line in the next iteration
                }
            }

            // Remove cursor after completion
            cursor.remove();

            animatedScreens.definition = true;
        }

        document.getElementById('viewProjectsButton').style.display = 'block';
    } finally {
        isTypingDefinition = false;
    }
}

function updateProject() {
    const project = projects[currentProjectIndex];
    const content = document.getElementById('currentProject');
    content.innerHTML = `
        <div class="line">
            <div class="line-number">1</div>
            <div class="line-content">
                <span class="keyword">let</span> <span class="function">project</span> <span class="operator">=</span> <span class="string">"${project.name}"</span>
            </div>
        </div>
        <div class="line">
            <div class="line-number">2</div>
            <div class="line-content">
                <span class="keyword">let</span> <span class="function">description</span> <span class="operator">=</span> <span class="string">"""</span>
            </div>
        </div>
        <div class="line">
            <div class="line-number">3</div>
            <div class="line-content indented">
                <span class="string">${project.description}</span>
            </div>
        </div>
        <div class="line">
            <div class="line-number">4</div>
            <div class="line-content">
                <span class="string">"""</span>
            </div>
        </div>
    `;

    document.getElementById('prevProject').disabled = currentProjectIndex === 0;
    document.getElementById('nextProject').disabled = currentProjectIndex === projects.length - 1;
}

// Show definition bubble near cursor
function showDefinitionBubble(event) {
    const bubble = document.getElementById('definitionBubble');
    const editorRect = document.querySelector('.editor').getBoundingClientRect();

    // Position bubble near the click position
    bubble.style.display = 'block';
    bubble.style.left = `${event.clientX - editorRect.left}px`;
    bubble.style.top = `${event.clientY - editorRect.top - 40}px`;
}

// Hide bubble when clicking elsewhere
document.addEventListener('click', (e) => {
    const bubble = document.getElementById('definitionBubble');
    if (bubble && !bubble.contains(e.target) && !e.target.closest('.presentMyself')) {
        bubble.style.display = 'none';
    }
});

document.getElementById('viewProjectsButton').addEventListener('click', () => {
    showScreen('projectsScreen');
    document.querySelector('#projectsScreen .back-button').style.display = 'block';
    updateProject();
});

document.getElementById('prevProject').addEventListener('click', () => {
    if (currentProjectIndex > 0) {
        currentProjectIndex--;
        updateProject();
    }
});

document.getElementById('nextProject').addEventListener('click', () => {
    if (currentProjectIndex < projects.length - 1) {
        currentProjectIndex++;
        updateProject();
    }
});

document.getElementById('definitionBubble').addEventListener('click', async () => {
    navigationStack.push('definitionScreen');
    showScreen('definitionScreen');
    await typeDefinition();
    showScreen('definitionScreen');
});

document.getElementById('viewProjectsButton').addEventListener('click', () => {
    navigationStack.push('projectsScreen');
    showScreen('projectsScreen');
    updateProject();
    setTimeout(() => showScreen('projectsScreen'), 50);
});

// Header back button handler
document.getElementById('headerBackButton').addEventListener('click', () => {
    if (navigationStack.length > 1) {
        // Remove current screen
        navigationStack.pop();
        // Go to previous screen
        const previousScreen = navigationStack[navigationStack.length - 1];
        showScreen(previousScreen);

        if (previousScreen === 'welcomeScreen') {
            document.getElementById('definitionBubble').style.display = 'none';
        }
    }
});

// Traffic light button functionality
const windowElement = document.querySelector('.window');
let isMaximized = false;
let previousSize = { width: '', height: '', left: '', top: '' };

// Z-index management for window layering
let currentZIndex = 1;

function bringToFront(windowEl) {
    currentZIndex++;
    windowEl.style.zIndex = currentZIndex;
}

// Dock functionality
const dockDot = document.querySelector('.dock-dot');
const dockApp = document.querySelector('.dock-app');

function updateDockIndicator() {
    // Indicator is active if window is open (not closed)
    // It stays active even when minimized
    if (windowElement.classList.contains('closed')) {
        dockDot.classList.remove('active');
    } else {
        dockDot.classList.add('active');
    }
}

// Initialize dock indicator
updateDockIndicator();

// Store window position before minimizing
let storedWindowPosition = null;

// Genie effect animation functions
function getDockIconCenter() {
    const dockIcon = document.querySelector('.dock-icon');
    const rect = dockIcon.getBoundingClientRect();
    return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
    };
}

function genieMinimize() {
    const dockCenter = getDockIconCenter();
    const windowRect = windowElement.getBoundingClientRect();
    const windowCenterX = windowRect.left + windowRect.width / 2;
    const windowCenterY = windowRect.top + windowRect.height / 2;

    // Convert to absolute positioning before animation (removes translateX(-50%) issue)
    windowElement.style.left = windowRect.left + 'px';
    windowElement.style.top = windowRect.top + 'px';
    windowElement.style.transform = 'none';

    // Store window position for restoration
    storedWindowPosition = {
        left: windowRect.left,
        top: windowRect.top,
        width: windowRect.width,
        height: windowRect.height,
        centerX: windowCenterX,
        centerY: windowCenterY
    };

    // Calculate translation needed to move window center to dock icon center
    const translateX = dockCenter.x - windowCenterX;
    const translateY = dockCenter.y - windowCenterY;

    windowElement.classList.add('minimizing');

    const animation = windowElement.animate([
        {
            transform: 'translate(0, 0) scale(1)',
            opacity: 1,
            offset: 0
        },
        {
            transform: `translate(${translateX * 0.3}px, ${translateY * 0.5}px) scale(0.8, 0.9)`,
            opacity: 0.95,
            offset: 0.3
        },
        {
            transform: `translate(${translateX * 0.7}px, ${translateY * 0.8}px) scale(0.4, 0.6)`,
            opacity: 0.7,
            offset: 0.6
        },
        {
            transform: `translate(${translateX}px, ${translateY}px) scale(0.05)`,
            opacity: 0,
            offset: 1
        }
    ], {
        duration: 500,
        easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
        fill: 'forwards'
    });

    animation.onfinish = () => {
        windowElement.classList.remove('minimizing');
        windowElement.classList.add('minimized');
        windowElement.style.transform = '';
        windowElement.style.opacity = '';
    };
}

function genieRestore() {
    if (!storedWindowPosition) return;

    const dockCenter = getDockIconCenter();

    // Use stored window position
    const windowCenterX = storedWindowPosition.centerX;
    const windowCenterY = storedWindowPosition.centerY;

    // Calculate translation from dock icon to stored window position
    const translateX = dockCenter.x - windowCenterX;
    const translateY = dockCenter.y - windowCenterY;

    windowElement.classList.remove('minimized');
    windowElement.classList.add('restoring');

    const animation = windowElement.animate([
        {
            transform: `translate(${translateX}px, ${translateY}px) scale(0.05)`,
            opacity: 0,
            offset: 0
        },
        {
            transform: `translate(${translateX * 0.7}px, ${translateY * 0.8}px) scale(0.4, 0.6)`,
            opacity: 0.7,
            offset: 0.4
        },
        {
            transform: `translate(${translateX * 0.3}px, ${translateY * 0.5}px) scale(0.8, 0.9)`,
            opacity: 0.95,
            offset: 0.7
        },
        {
            transform: 'translate(0, 0) scale(1)',
            opacity: 1,
            offset: 1
        }
    ], {
        duration: 500,
        easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
        fill: 'forwards'
    });

    animation.onfinish = () => {
        windowElement.classList.remove('restoring');
        windowElement.style.transform = '';
        windowElement.style.opacity = '';
    };
}

// Dock app click - show/hide window
dockApp.addEventListener('click', () => {
    if (windowElement.classList.contains('closed')) {
        windowElement.classList.remove('closed');
        updateDockIndicator();
        bringToFront(windowElement);
    } else if (windowElement.classList.contains('minimized')) {
        genieRestore();
        bringToFront(windowElement);
    } else {
        genieMinimize();
    }
});

// Close button - hide the window
document.querySelector('.window-button.close').addEventListener('click', () => {
    windowElement.classList.add('closed');
    updateDockIndicator();
});

// Minimize button - minimize with animation
document.querySelector('.window-button.minimize').addEventListener('click', () => {
    if (!windowElement.classList.contains('minimized')) {
        genieMinimize();
    }
});

// Maximize button - toggle fullscreen
document.querySelector('.window-button.maximize').addEventListener('click', () => {
    if (!isMaximized) {
        // Save current size and position
        const rect = windowElement.getBoundingClientRect();
        previousSize.width = windowElement.style.width || rect.width + 'px';
        previousSize.height = windowElement.style.height || rect.height + 'px';
        previousSize.left = windowElement.style.left || rect.left + 'px';
        previousSize.top = windowElement.style.top || rect.top + 'px';

        // Get dock position to avoid overlapping
        const dock = document.querySelector('.dock');
        const dockRect = dock.getBoundingClientRect();
        const dockTop = dockRect.top;
        const padding = 20; // Space between window bottom and dock top
        const margin = 20; // Margin from edges

        // Calculate maximum size based on viewport, accounting for dock
        const maxWidth = window.innerWidth;
        // Available height is from margin to dock top minus padding
        const maxHeight = dockTop - margin - padding;

        // Set to maximized size
        windowElement.style.width = maxWidth + 'px';
        windowElement.style.height = maxHeight + 'px';
        windowElement.style.left = margin + 'px';
        windowElement.style.top = margin + 'px';
        windowElement.style.transform = 'none';

        windowElement.classList.add('maximized');
        isMaximized = true;
    } else {
        // Restore previous size and position
        windowElement.classList.remove('maximized');
        windowElement.style.width = previousSize.width;
        windowElement.style.height = previousSize.height;
        windowElement.style.left = previousSize.left;
        windowElement.style.top = previousSize.top;
        isMaximized = false;
    }
});

// Window resize functionality
let isResizing = false;
let resizeDirection = '';
let startX, startY, startWidth, startHeight, startLeft, startTop;

function initResize(e, direction) {
    if (isMaximized) return;

    isResizing = true;
    resizeDirection = direction;
    startX = e.clientX;
    startY = e.clientY;

    const rect = windowElement.getBoundingClientRect();
    startWidth = rect.width;
    startHeight = rect.height;
    startLeft = rect.left;
    startTop = rect.top;

    e.preventDefault();
}

function doResize(e) {
    if (!isResizing) return;

    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    let newWidth = startWidth;
    let newHeight = startHeight;
    let newLeft = startLeft;
    let newTop = startTop;

    // Apply minimum constraints
    const minWidth = 400;
    const minHeight = 300;

    // Get viewport constraints
    const dock = document.querySelector('.dock');
    const dockRect = dock.getBoundingClientRect();
    const dockTop = dockRect.top;
    const maxWidth = window.innerWidth;
    const maxHeight = dockTop - 20; // 20px padding from dock

    // Handle horizontal resize
    if (resizeDirection.includes('e')) {
        newWidth = startWidth + deltaX;
        // Constrain to viewport right edge
        newWidth = Math.min(newWidth, maxWidth - startLeft);
    } else if (resizeDirection.includes('w')) {
        newWidth = startWidth - deltaX;
        if (newWidth >= minWidth) {
            newLeft = startLeft + deltaX;
            // Constrain to viewport left edge
            if (newLeft < 0) {
                newWidth = startWidth + startLeft;
                newLeft = 0;
            }
        }
    }

    // Handle vertical resize
    if (resizeDirection.includes('s')) {
        newHeight = startHeight + deltaY;
        // Constrain to dock
        newHeight = Math.min(newHeight, dockTop - startTop - 20);
    } else if (resizeDirection.includes('n')) {
        newHeight = startHeight - deltaY;
        if (newHeight >= minHeight) {
            newTop = startTop + deltaY;
            // Constrain to viewport top edge
            if (newTop < 0) {
                newHeight = startHeight + startTop;
                newTop = 0;
            }
        }
    }

    // Apply size changes
    if (newWidth >= minWidth && newWidth <= maxWidth) {
        windowElement.style.width = newWidth + 'px';
        if (resizeDirection.includes('w')) {
            windowElement.style.left = newLeft + 'px';
            windowElement.style.transform = 'none';
        }
    }

    if (newHeight >= minHeight && newHeight <= maxHeight) {
        windowElement.style.height = newHeight + 'px';
        if (resizeDirection.includes('n')) {
            windowElement.style.top = newTop + 'px';
        }
    }
}

function stopResize() {
    isResizing = false;
    resizeDirection = '';
}

// Add event listeners to resize handles (only for portfolio window)
windowElement.querySelectorAll('.resize-handle').forEach(handle => {
    handle.addEventListener('mousedown', (e) => {
        const direction = Array.from(handle.classList).find(c => c !== 'resize-handle');
        initResize(e, direction);
    });
});

// Window drag functionality
let isDragging = false;
let dragStartX, dragStartY, windowStartX, windowStartY;

function initDrag(e) {
    if (isMaximized) return;

    // Don't start drag if clicking on window buttons
    if (e.target.closest('.window-button')) return;

    isDragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;

    const rect = windowElement.getBoundingClientRect();
    windowStartX = rect.left;
    windowStartY = rect.top;

    e.preventDefault();
}

function doDrag(e) {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStartX;
    const deltaY = e.clientY - dragStartY;

    let newLeft = windowStartX + deltaX;
    let newTop = windowStartY + deltaY;

    // Get window dimensions
    const rect = windowElement.getBoundingClientRect();
    const windowWidth = rect.width;
    const windowHeight = rect.height;

    // Get dock position to avoid overlap
    const dock = document.querySelector('.dock');
    const dockRect = dock.getBoundingClientRect();
    const dockTop = dockRect.top;

    // Apply viewport boundaries
    const minLeft = 0;
    const maxLeft = window.innerWidth - windowWidth;
    const minTop = 0;
    const maxTop = dockTop - windowHeight - 20; // 20px padding from dock

    // Constrain to boundaries
    newLeft = Math.max(minLeft, Math.min(newLeft, maxLeft));
    newTop = Math.max(minTop, Math.min(newTop, maxTop));

    windowElement.style.left = newLeft + 'px';
    windowElement.style.top = newTop + 'px';
    windowElement.style.transform = 'none';
}

function stopDrag() {
    isDragging = false;
}

// Add drag event listeners to window header
const windowHeader = document.querySelector('.window-header');
windowHeader.addEventListener('mousedown', initDrag);

// Bring window to front when clicked anywhere
windowElement.addEventListener('mousedown', () => {
    bringToFront(windowElement);
});

document.addEventListener('mousemove', (e) => {
    doDrag(e);
    doResize(e);
    doSimulatorDrag(e);
    doSimulatorResize(e);
});

document.addEventListener('mouseup', () => {
    stopDrag();
    stopResize();
    stopSimulatorDrag();
    stopSimulatorResize();
});

// Keep window within viewport bounds when browser is resized
function constrainWindowToViewport() {
    if (windowElement.classList.contains('minimized') ||
        windowElement.classList.contains('closed') ||
        isMaximized) {
        return;
    }

    const rect = windowElement.getBoundingClientRect();
    const dock = document.querySelector('.dock');
    const dockRect = dock.getBoundingClientRect();
    const dockTop = dockRect.top;

    let newLeft = rect.left;
    let newTop = rect.top;
    let newWidth = rect.width;
    let newHeight = rect.height;
    let changed = false;

    // Constrain width and height if window is too large for viewport
    const maxWidth = window.innerWidth;
    const maxHeight = dockTop - 20; // 20px padding from dock

    if (newWidth > maxWidth) {
        newWidth = maxWidth;
        changed = true;
    }

    if (newHeight > maxHeight) {
        newHeight = maxHeight;
        changed = true;
    }

    // Constrain position to keep window within viewport
    const minLeft = 0;
    const maxLeft = window.innerWidth - newWidth;
    const minTop = 0;
    const maxTop = dockTop - newHeight - 20;

    if (newLeft < minLeft) {
        newLeft = minLeft;
        changed = true;
    } else if (newLeft > maxLeft) {
        newLeft = maxLeft;
        changed = true;
    }

    if (newTop < minTop) {
        newTop = minTop;
        changed = true;
    } else if (newTop > maxTop) {
        newTop = maxTop;
        changed = true;
    }

    // Apply changes if needed
    if (changed) {
        windowElement.style.width = newWidth + 'px';
        windowElement.style.height = newHeight + 'px';
        windowElement.style.left = newLeft + 'px';
        windowElement.style.top = newTop + 'px';
        windowElement.style.transform = 'none';
    }
}

// Handle browser resize
window.addEventListener('resize', constrainWindowToViewport);

// Simulator window functionality
const simulatorWindow = document.querySelector('.simulator-window');
let storedSimulatorPosition = null;

// Get simulator dock elements
const simulatorDockApp = document.querySelector('.dock-app[data-app="simulator"]');
const simulatorDockDot = simulatorDockApp.querySelector('.dock-dot');

function updateSimulatorDockIndicator() {
    if (simulatorWindow.classList.contains('closed')) {
        simulatorDockDot.classList.remove('active');
    } else {
        simulatorDockDot.classList.add('active');
    }
}

// Initialize simulator dock indicator
updateSimulatorDockIndicator();

// Helper function to get dock icon center for any icon
function getDockIconCenterForElement(iconElement) {
    const rect = iconElement.getBoundingClientRect();
    return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
    };
}

// Simulator genie effects
function genieMinimizeSimulator() {
    const dockCenter = getDockIconCenterForElement(simulatorDockApp.querySelector('.dock-icon'));
    const windowRect = simulatorWindow.getBoundingClientRect();
    const windowCenterX = windowRect.left + windowRect.width / 2;
    const windowCenterY = windowRect.top + windowRect.height / 2;

    // Convert to absolute positioning
    simulatorWindow.style.left = windowRect.left + 'px';
    simulatorWindow.style.top = windowRect.top + 'px';
    simulatorWindow.style.transform = 'none';

    // Store window position
    storedSimulatorPosition = {
        left: windowRect.left,
        top: windowRect.top,
        width: windowRect.width,
        height: windowRect.height,
        centerX: windowCenterX,
        centerY: windowCenterY
    };

    const translateX = dockCenter.x - windowCenterX;
    const translateY = dockCenter.y - windowCenterY;

    simulatorWindow.classList.add('minimizing');

    const animation = simulatorWindow.animate([
        { transform: 'translate(0, 0) scale(1)', opacity: 1, offset: 0 },
        { transform: `translate(${translateX * 0.3}px, ${translateY * 0.5}px) scale(0.8, 0.9)`, opacity: 0.95, offset: 0.3 },
        { transform: `translate(${translateX * 0.7}px, ${translateY * 0.8}px) scale(0.4, 0.6)`, opacity: 0.7, offset: 0.6 },
        { transform: `translate(${translateX}px, ${translateY}px) scale(0.05)`, opacity: 0, offset: 1 }
    ], {
        duration: 500,
        easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
        fill: 'forwards'
    });

    animation.onfinish = () => {
        simulatorWindow.classList.remove('minimizing');
        simulatorWindow.classList.add('minimized');
        simulatorWindow.style.transform = '';
        simulatorWindow.style.opacity = '';
    };
}

function genieRestoreSimulator() {
    if (!storedSimulatorPosition) return;

    const dockCenter = getDockIconCenterForElement(simulatorDockApp.querySelector('.dock-icon'));
    const windowCenterX = storedSimulatorPosition.centerX;
    const windowCenterY = storedSimulatorPosition.centerY;

    const translateX = dockCenter.x - windowCenterX;
    const translateY = dockCenter.y - windowCenterY;

    simulatorWindow.classList.remove('minimized');
    simulatorWindow.classList.add('restoring');

    const animation = simulatorWindow.animate([
        { transform: `translate(${translateX}px, ${translateY}px) scale(0.05)`, opacity: 0, offset: 0 },
        { transform: `translate(${translateX * 0.7}px, ${translateY * 0.8}px) scale(0.4, 0.6)`, opacity: 0.7, offset: 0.4 },
        { transform: `translate(${translateX * 0.3}px, ${translateY * 0.5}px) scale(0.8, 0.9)`, opacity: 0.95, offset: 0.7 },
        { transform: 'translate(0, 0) scale(1)', opacity: 1, offset: 1 }
    ], {
        duration: 500,
        easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
        fill: 'forwards'
    });

    animation.onfinish = () => {
        simulatorWindow.classList.remove('restoring');
        simulatorWindow.style.transform = '';
        simulatorWindow.style.opacity = '';
    };
}

// Simulator dock app click - toggle minimize/restore or open
simulatorDockApp.addEventListener('click', () => {
    if (simulatorWindow.classList.contains('closed')) {
        simulatorWindow.classList.remove('closed');
        updateSimulatorDockIndicator();
        bringToFront(simulatorWindow);
    } else if (simulatorWindow.classList.contains('minimized')) {
        genieRestoreSimulator();
        bringToFront(simulatorWindow);
    } else {
        genieMinimizeSimulator();
    }
});

// Make simulator window draggable from header
let isSimulatorDragging = false;
let simulatorDragStartX, simulatorDragStartY, simulatorWindowStartX, simulatorWindowStartY;

const simulatorHeader = simulatorWindow.querySelector('.simulator-header');
simulatorHeader.addEventListener('mousedown', (e) => {
    // Don't drag if clicking on window buttons
    if (e.target.classList.contains('window-button')) return;

    isSimulatorDragging = true;
    simulatorDragStartX = e.clientX;
    simulatorDragStartY = e.clientY;

    const rect = simulatorWindow.getBoundingClientRect();
    simulatorWindowStartX = rect.left;
    simulatorWindowStartY = rect.top;

    e.preventDefault();
});

// Bring simulator window to front when clicked anywhere
simulatorWindow.addEventListener('mousedown', () => {
    bringToFront(simulatorWindow);
});

function doSimulatorDrag(e) {
    if (!isSimulatorDragging) return;

    const deltaX = e.clientX - simulatorDragStartX;
    const deltaY = e.clientY - simulatorDragStartY;

    let newLeft = simulatorWindowStartX + deltaX;
    let newTop = simulatorWindowStartY + deltaY;

    const rect = simulatorWindow.getBoundingClientRect();
    const windowWidth = rect.width;
    const windowHeight = rect.height;

    const dock = document.querySelector('.dock');
    const dockRect = dock.getBoundingClientRect();
    const dockTop = dockRect.top;

    const minLeft = 0;
    const maxLeft = window.innerWidth - windowWidth;
    const minTop = 0;
    const maxTop = dockTop - windowHeight - 20;

    newLeft = Math.max(minLeft, Math.min(newLeft, maxLeft));
    newTop = Math.max(minTop, Math.min(newTop, maxTop));

    simulatorWindow.style.left = newLeft + 'px';
    simulatorWindow.style.top = newTop + 'px';
    simulatorWindow.style.transform = 'none';
}

function stopSimulatorDrag() {
    isSimulatorDragging = false;
}

// Simulator window resize functionality
let isSimulatorResizing = false;
let simulatorResizeDirection = null;
let simulatorResizeStartX, simulatorResizeStartY;
let simulatorResizeStartWidth, simulatorResizeStartHeight, simulatorResizeStartLeft, simulatorResizeStartTop;

const simulatorResizeHandles = simulatorWindow.querySelectorAll('.resize-handle');
simulatorResizeHandles.forEach(handle => {
    handle.addEventListener('mousedown', (e) => {
        isSimulatorResizing = true;
        simulatorResizeDirection = handle.classList[1]; // n, s, e, w, ne, nw, se, sw
        simulatorResizeStartX = e.clientX;
        simulatorResizeStartY = e.clientY;

        const rect = simulatorWindow.getBoundingClientRect();
        simulatorResizeStartWidth = rect.width;
        simulatorResizeStartHeight = rect.height;
        simulatorResizeStartLeft = rect.left;
        simulatorResizeStartTop = rect.top;

        e.preventDefault();
        e.stopPropagation();
    });
});

function doSimulatorResize(e) {
    if (!isSimulatorResizing) return;

    const deltaX = e.clientX - simulatorResizeStartX;
    const deltaY = e.clientY - simulatorResizeStartY;

    let newWidth = simulatorResizeStartWidth;
    let newHeight = simulatorResizeStartHeight;
    let newLeft = simulatorResizeStartLeft;
    let newTop = simulatorResizeStartTop;

    const minWidth = 300;
    const minHeight = 400;

    // Handle horizontal resizing
    if (simulatorResizeDirection.includes('e')) {
        newWidth = Math.max(minWidth, simulatorResizeStartWidth + deltaX);
    } else if (simulatorResizeDirection.includes('w')) {
        const potentialWidth = simulatorResizeStartWidth - deltaX;
        if (potentialWidth >= minWidth) {
            newWidth = potentialWidth;
            newLeft = simulatorResizeStartLeft + deltaX;
        }
    }

    // Handle vertical resizing
    if (simulatorResizeDirection.includes('s')) {
        newHeight = Math.max(minHeight, simulatorResizeStartHeight + deltaY);
    } else if (simulatorResizeDirection.includes('n')) {
        const potentialHeight = simulatorResizeStartHeight - deltaY;
        if (potentialHeight >= minHeight) {
            newHeight = potentialHeight;
            newTop = simulatorResizeStartTop + deltaY;
        }
    }

    // Constrain to viewport
    const dock = document.querySelector('.dock');
    const dockRect = dock.getBoundingClientRect();
    const dockTop = dockRect.top;

    const maxWidth = window.innerWidth - newLeft;
    const maxHeight = dockTop - newTop - 20;

    newWidth = Math.min(newWidth, maxWidth);
    newHeight = Math.min(newHeight, maxHeight);

    // Apply new dimensions
    simulatorWindow.style.width = newWidth + 'px';
    simulatorWindow.style.height = newHeight + 'px';
    simulatorWindow.style.left = newLeft + 'px';
    simulatorWindow.style.top = newTop + 'px';
}

function stopSimulatorResize() {
    if (isSimulatorResizing) {
        isSimulatorResizing = false;
        simulatorResizeDirection = null;
    }
}

// Simulator window buttons
const simulatorCloseBtn = simulatorWindow.querySelector('.window-button.close');
const simulatorMinimizeBtn = simulatorWindow.querySelector('.window-button.minimize');

simulatorCloseBtn.addEventListener('click', () => {
    simulatorWindow.classList.add('closed');
    updateSimulatorDockIndicator();
});

simulatorMinimizeBtn.addEventListener('click', () => {
    genieMinimizeSimulator();
});

typeInitialScreen();
