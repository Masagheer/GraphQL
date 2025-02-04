console.log('display.js loaded');

// Display the user data on the page
export function displayUserData(user) {
    // Update header username
    document.getElementById('header-username').textContent = user.login || 'User';

    // Basic Information
    document.getElementById('user-id').textContent = user.id || 'N/A';
    document.getElementById('user-login').textContent = user.login || 'N/A';
    document.getElementById('user-firstname').textContent = user.firstName || 'N/A';
    document.getElementById('user-lastname').textContent = user.lastName || 'N/A';
    document.getElementById('user-email').textContent = user.email || 'N/A';
    document.getElementById('user-campus').textContent = user.campus || 'N/A';
}

// Display the last projects
export function displayLastProjects(projects) {
    const projectsList = document.getElementById('projects-list');

    if (projects && projects.length > 0) {
        const projectsHTML = projects
            .map(project => `
                <div class="project-item">
                    <span class="project-name">${project.object.name}</span>
                </div>
            `)
            .join('');

        projectsList.innerHTML = projectsHTML;
    } else {
        projectsList.textContent = 'No recent projects found';
    }
}

// Display XP Data
export function displayXPData(amount) {
    const xpInfo = document.getElementById('xp-info');
    let displayValue;
    let unit;

    // Check if the amount is large enough to be displayed in MB
    if (amount >= 1000000) {
        displayValue = (amount / 1000000).toFixed(2);
        unit = 'MB';
    } else {
        displayValue = Math.round(amount / 1000);
        unit = 'kB';
    }

    xpInfo.innerHTML = `
        <div class="xp-display">
            <span class="xp-amount">${displayValue}</span>
            <span class="xp-label">${unit}</span>
        </div>
    `;
}

// Display Audit Ratio
export function displayAuditRatio(userData) {
    const auditRatio = document.getElementById('audit-ratio');
    const totalUp = userData.totalUp || 0;
    const totalDown = userData.totalDown || 0;
    const ratio = totalDown > 0 ? (totalUp / totalDown).toFixed(1) : 'N/A';

    // Convert bytes to MB
    const upMB = (totalUp / 1000000).toFixed(2);
    const downMB = (totalDown / 1000000).toFixed(2);

    // Calculate max value for progress bars
    const maxValue = Math.max(totalUp, totalDown);

    // Create SVG progress bars
    auditRatio.innerHTML = `
        <div class="audit-stats">
            <div class="audit-bar-container">
                <div class="audit-label">Done: ${upMB} MB</div>
                <svg width="100%" height="30">
                    <rect class="bar-bg" width="100%" height="20" rx="5"></rect>
                    <rect class="bar-fill done-bar" 
                          width="${(totalUp / maxValue) * 100}%" 
                          height="20" 
                          rx="5"></rect>
                </svg>
            </div>
            <div class="audit-bar-container">
                <div class="audit-label">Received: ${downMB} MB</div>
                <svg width="100%" height="30">
                    <rect class="bar-bg" width="100%" height="20" rx="5"></rect>
                    <rect class="bar-fill received-bar" 
                          width="${(totalDown / maxValue) * 100}%" 
                          height="20" 
                          rx="5"></rect>
                </svg>
            </div>
            <div class="audit-ratio-value">
                Ratio: ${ratio}
            </div>
        </div>
    `;
}

// Display Skills Radar Chart
export function displaySkillsRadar(skills) {
    const container = document.getElementById('skills-container');
    const size = 400;
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.3;

    if (!skills || skills.length === 0) {
        container.innerHTML = 'No skills data available';
        return;
    }

    // Find max amount for scaling
    const maxAmount = Math.max(...skills.map(s => s.amount));

    // Calculate points for each skill
    const points = skills.map((skill, i) => {
        const angle = (i * 2 * Math.PI / skills.length) - Math.PI / 2;
        const value = (skill.amount / maxAmount) * radius;
        return {
            x: centerX + value * Math.cos(angle),
            y: centerY + value * Math.sin(angle),
            label: skill.type.replace('skill_', ''),
            value: skill.amount
        };
    });

    // Create SVG
    const svg = `
        <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
            <!-- Background circles -->
            ${[0.2, 0.4, 0.6, 0.8, 1, 1.2].map(scale => `
                <circle 
                    cx="${centerX}" 
                    cy="${centerY}" 
                    r="${radius * scale}"
                    fill="none"
                    stroke="#ddd"
                    stroke-width="1"
                />
            `).join('')}
            
            <!-- Skill lines -->
            ${points.map((_, i) => {
        const angle = (i * 2 * Math.PI / skills.length) - Math.PI / 2;
        return `
                    <line 
                        x1="${centerX}"
                        y1="${centerY}"
                        x2="${centerX + radius * Math.cos(angle)}"
                        y2="${centerY + radius * Math.sin(angle)}"
                        stroke="#ddd"
                        stroke-width="1"
                    />
                `;
    }).join('')}
            
            <!-- Skill area -->
            <path
                d="${points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + 'Z'}"
                fill="rgba(40, 80, 167, 0.3)"
                stroke="#0186FE"
                stroke-width="2"
            />
            
            <!-- Skill points -->
            ${points.map(p => `
                <circle
                    cx="${p.x}"
                    cy="${p.y}"
                    r="4"
                    fill="#0186FE"
                />
            `).join('')}
            
            <!-- Labels -->
            ${points.map((p, i) => {
        const angle = (i * 2 * Math.PI / skills.length) - Math.PI / 2;
        const labelRadius = radius + 40;
        const labelX = centerX + labelRadius * Math.cos(angle);
        const labelY = centerY + labelRadius * Math.sin(angle);

        // Determine text anchor based on position
        let textAnchor;
        if (angle < -Math.PI / 2 || angle > Math.PI / 2) {
            textAnchor = 'end';
        } else if (angle === -Math.PI / 2 || angle === Math.PI / 2) {
            textAnchor = 'middle';
        } else {
            textAnchor = 'start';
        }

        return `
            <text
                x="${labelX}"
                y="${labelY}"
                text-anchor="${textAnchor}"
                class="skill-label"
                dominant-baseline="middle"
            >${p.label}</text>
        `;
    }).join('')}
        </svg>
    `;

    const values = `
        <div class="skill-value-container">
            ${skills.map(skill => `
                <div class="skill-value">
                    <strong>${skill.type.replace('skill_', '')}</strong>: ${skill.amount}
                </div>
            `).join('')}
        </div>
    `;

    container.innerHTML = svg;
    container.innerHTML += values;
}

