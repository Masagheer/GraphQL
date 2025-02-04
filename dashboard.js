import { executeGraphQLQuery, capitalizeFirstLetter } from './utils.js';
import { BASIC_INFO_QUERY, LAST_PROJECTS_QUERY, XP_QUERY, AUDIT_RATIO_QUERY, SKILLS_QUERY, TECH_SKILLS_QUERY } from './queries.js';
import { displayUserData, displayLastProjects, displayXPData, displayAuditRatio, displaySkillsRadar } from './display.js';

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

//
async function fetchUserData() {
    try {
        const data = await executeGraphQLQuery(BASIC_INFO_QUERY);
        displayUserData(data.user[0]);
    } catch (error) {
        handleError(error);
    }
}
// for the recent projects
async function fetchLastProjects() {
    try {
        const data = await executeGraphQLQuery(LAST_PROJECTS_QUERY);
        displayLastProjects(data.transaction);
    } catch (error) {
        handleError(error, 'projects-list');
    }
}

// for the xp
async function fetchXPData(userId) {
    try {
        const data = await executeGraphQLQuery(XP_QUERY(userId));
        displayXPData(data.transaction_aggregate.aggregate.sum.amount);
        console.log(data.transaction_aggregate.aggregate.sum.amount);
    } catch (error) {
        handleError(error, 'xp-info');
    }
}

// for the audit ratio
async function fetchAuditData() {
    try {
        const data = await executeGraphQLQuery(AUDIT_RATIO_QUERY);
        displayAuditRatio(data.user[0]);
        console.log(data.user[0]);
    } catch (error) {
        handleError(error, 'audit-ratio');
    }
}

// for the skills
async function fetchSkillsData() {
    try {
        const data = await executeGraphQLQuery(SKILLS_QUERY);
        const uniqueSkills = data.user[0].transactions.reduce((acc, curr) => {
            if (!acc.some(skill => skill.type === curr.type)) {
                acc.push(curr);
            }
            return acc;
        }, []);
        displaySkillsRadar(uniqueSkills.slice(0, 6));
        console.log(uniqueSkills.slice(0, 6));
    } catch (error) {
        handleError(error, 'skills-container');
    }
}

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

// async function fetchTechSkills() {
//     try {
//         const response = await executeGraphQLQuery(TECH_SKILLS_QUERY);
//         const transactions = response.user[0].transactions;

//         const techSkills = {
//             'go': 'skill_go',
//             'javascript': 'skill_js',
//             'html': 'skill_html',
//             'css': 'skill_css',
//             'unix': 'skill_unix',
//             'docker': 'skill_docker',
//             'sql': 'skill_sql'
//         };

//         const skillsData = Object.entries(techSkills).map(([key, skillType]) => {
//             const skill = transactions.find(t => t.type === skillType);
//             return {
//                 skill: key.toUpperCase(),
//                 amount: skill ? skill.amount : 0
//             };
//         });

//         const maxValue = Math.max(...skillsData.map(s => s.amount));
//         const scale = maxValue === 0 ? 1 : maxValue;

//         // Create the radar chart SVG
//         const radarSvg = createTechSkillsRadar(skillsData, scale);

//         // Update the main SVG container
//         const container = document.getElementById('tech-skills-container');
//         container.innerHTML = radarSvg;
//     } catch (error) {
//         console.error('Error fetching tech skills:', error);
//         document.getElementById('tech-skills-container').innerHTML = 'Error loading tech skills';
//     }
// }

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


async function fetchTechSkills() {
    try {
        const response = await executeGraphQLQuery(TECH_SKILLS_QUERY);
        const transactions = response.user[0].transactions;

        const techSkills = {
            'go': 'skill_go',
            'javascript': 'skill_js',
            'html': 'skill_html',
            'css': 'skill_css',
            'unix': 'skill_unix',
            'docker': 'skill_docker',
            'sql': 'skill_sql'
        };

        const skillsData = Object.entries(techSkills).map(([key, skillType]) => {
            const skill = transactions.find(t => t.type === skillType);
            return {
                skill: key.toUpperCase(),
                amount: skill ? skill.amount : 0
            };
        });

        const maxValue = Math.max(...skillsData.map(s => s.amount));
        const barSvg = createTechSkillsBarChart(skillsData, maxValue);

        const container = document.getElementById('tech-skills-container');
        container.innerHTML = barSvg;
    } catch (error) {
        console.error('Error fetching tech skills:', error);
        document.getElementById('tech-skills-container').innerHTML = 'Error loading tech skills';
    }
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
