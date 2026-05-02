/**
 * Reusable Component Factory for DemocraSee
 */

/**
 * Creates a generic card element
 * @param {string} title 
 * @param {string} content 
 * @param {string} category 
 * @returns {HTMLElement}
 */
export function createCard(title, content, category = '') {
    const card = document.createElement('div');
    card.className = 'custom-card animated-card';
    card.innerHTML = `
        ${category ? `<span class="card-category">${category}</span>` : ''}
        <h3>${title}</h3>
        <p>${content}</p>
    `;
    return card;
}

/**
 * Creates a section container
 * @param {string} id 
 * @param {string} heading 
 * @param {Array<HTMLElement>} children 
 * @returns {HTMLElement}
 */
export function createSection(id, heading, children = []) {
    const section = document.createElement('section');
    section.id = id;
    section.className = 'tab-panel';
    
    const header = document.createElement('div');
    header.className = 'panel-header';
    header.innerHTML = `<h2>${heading}</h2>`;
    section.appendChild(header);
    
    const body = document.createElement('div');
    body.className = 'panel-body';
    children.forEach(child => body.appendChild(child));
    section.appendChild(body);
    
    return section;
}

/**
 * Creates a progress bar
 * @param {number} current 
 * @param {number} total 
 * @param {string} label 
 * @returns {HTMLElement}
 */
export function createProgressBar(current, total, label = '') {
    const wrapper = document.createElement('div');
    wrapper.className = 'progress-wrapper';
    const percent = (current / total) * 100;
    
    wrapper.innerHTML = `
        <div class="progress-info">
            <span>${label}</span>
            <span>${current}/${total}</span>
        </div>
        <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width: ${percent}%"></div>
        </div>
    `;
    return wrapper;
}

/**
 * Creates a Lucide icon element
 * @param {string} name 
 * @returns {HTMLElement}
 */
export function createIcon(name) {
    const icon = document.createElement('i');
    icon.setAttribute('data-lucide', name);
    return icon;
}
