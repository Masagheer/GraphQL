import { executeGraphQLQuery, capitalizeFirstLetter } from './utils.js';
import { BASIC_INFO_QUERY, LAST_PROJECTS_QUERY, XP_QUERY, AUDIT_RATIO_QUERY, SKILLS_QUERY, TECH_SKILLS_QUERY } from './queries.js';
import { displayUserData, displayLastProjects, displayXPData, displayAuditRatio, displaySkillsRadar } from './display.js';
import { fetchUserData, fetchLastProjects, fetchXPData, fetchAuditData, fetchSkillsData, fetchTechSkills } from './fetchData.js';

// for the dashboard
document.addEventListener('DOMContentLoaded', async () => {
    if (!auth.isAuthenticated()) {
        window.location.href = '/index.html';
        return;
    }
    try {
        // First fetch user data as it contains the user ID needed for XP
        const userData = await executeGraphQLQuery(BASIC_INFO_QUERY);
        const user = userData.user[0];

        // Display user data first
        displayUserData(user);

        // Then fetch all other data in parallel
        await Promise.all([
            fetchLastProjects(),
            fetchAuditData(),
            fetchSkillsData(),
            fetchXPData(user.id),
            fetchTechSkills()
        ]);
    } catch (error) {
        handleError(error);
    }
});

// Error handling helper
function handleError(error, elementId) {
    console.error('Error:', error);
    if (elementId) {
        document.getElementById(elementId).textContent = 'Error loading data: ' + error.message;
    } else {
        document.querySelectorAll('[id$="-list"], [id$="-info"], [id$="-ratio"], [id$="container"]')
            .forEach(element => {
                element.textContent = 'Error loading data: ' + error.message;
            });
    }

    if (error.message.includes('JWT')) {
        auth.logout();
    }
}

/*Last Graph Tech skills*/
function createTechSkillsRadar(skills, maxAmount) {
    const size = 400;
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.3;

    // Create SVG for the radar chart
    return `
        <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
            <!-- Background circles -->
            ${[0.2, 0.4, 0.6, 0.8, 1.0].map(scale => `
                <circle cx="${centerX}" cy="${centerY}" r="${radius * scale}" fill="none" stroke="#ddd" stroke-width="1"/>
            `).join('')}
            
            <!-- Skill lines -->
            ${skills.map((_, i) => {
                const angle = (i * 2 * Math.PI / skills.length) - Math.PI / 2;
                return `
                    <line x1="${centerX}" y1="${centerY}" 
                          x2="${centerX + radius * Math.cos(angle)}" 
                          y2="${centerY + radius * Math.sin(angle)}" 
                          stroke="#ddd" stroke-width="1"/>
                `;
            }).join('')}
            
            <!-- Skill area -->
            <path d="${skills.map((skill, i) => {
                const angle = (i * 2 * Math.PI / skills.length) - Math.PI / 2;
                const value = (skill.amount / maxAmount) * radius;
                const x = centerX + value * Math.cos(angle);
                const y = centerY + value * Math.sin(angle);
                return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ')} Z" 
                  fill="rgba(40, 80, 167, 0.3)" 
                  stroke="#0186FE" 
                  stroke-width="2"/>
            
            <!-- Skill points -->
            ${skills.map((skill, i) => {
                const angle = (i * 2 * Math.PI / skills.length) - Math.PI / 2;
                const value = (skill.amount / maxAmount) * radius;
                const x = centerX + value * Math.cos(angle);
                const y = centerY + value * Math.sin(angle);
                return `<circle cx="${x}" cy="${y}" r="4" fill="#0186FE"/>`;
            }).join('')}
            
            <!-- Labels -->
            ${skills.map((skill, i) => {
                const angle = (i * 2 * Math.PI / skills.length) - Math.PI / 2;
                const labelRadius = radius + 30;
                const labelX = centerX + labelRadius * Math.cos(angle);
                const labelY = centerY + labelRadius * Math.sin(angle);
                return `<text x="${labelX}" y="${labelY}" text-anchor="${angle < -Math.PI / 2 || angle > Math.PI / 2 ? 'end' : 'start'}" class="tech-skill-label" dominant-baseline="middle">${skill.skill}</text>`;
            }).join('')}
        </svg>
    `;
}

function createTechSkillsBarChart(skills, maxAmount) {
    const barWidth = 50;
    const gap = 10;
    const height = 300;
    const scale = height / maxAmount;

    // Create the SVG element
    const svgWidth = skills.length * (barWidth + gap);
    let svg = `<svg width="${svgWidth}" height="${height}" viewBox="0 0 ${svgWidth} ${height}">`;

    // Generate bars
    skills.forEach((skill, i) => {
        const barHeight = skill.amount * scale;
        const x = i * (barWidth + gap);
        const y = height - barHeight;

        svg += `
            <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" fill="#0186FE"/>
            <text x="${x + barWidth / 2}" y="${y - 5}" text-anchor="middle" fill="#000">${skill.skill}</text>
            <text x="${x + barWidth / 2}" y="${y - 20}" text-anchor="middle" fill="#000">${skill.amount}</text>
        `;
    });

    svg += `</svg>`;
    return svg;
}

const barSvg = createTechSkillsBarChart(skillsData, maxValue);
container.innerHTML = barSvg; // Replace the radar chart with the bar chart
