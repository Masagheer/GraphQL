console.log('fetchData.js loaded');

import { executeGraphQLQuery } from './utils.js';
import { 
    BASIC_INFO_QUERY, 
    LAST_PROJECTS_QUERY, 
    XP_QUERY, 
    AUDIT_RATIO_QUERY, 
    SKILLS_QUERY, 
    TECH_SKILLS_QUERY 
} from './queries.js';
import { 
    displayUserData, 
    displayLastProjects, 
    displayXPData, 
    displayAuditRatio, 
    displaySkillsRadar 
} from './display.js';

// Fetch and display user data
export async function fetchUserData() {
    try {
        const data = await executeGraphQLQuery(BASIC_INFO_QUERY);
        displayUserData(data.user[0]);
    } catch (error) {
        handleError(error);
    }
}

// Fetch and display recent projects
export async function fetchLastProjects() {
    try {
        const data = await executeGraphQLQuery(LAST_PROJECTS_QUERY);
        displayLastProjects(data.transaction);
    } catch (error) {
        handleError(error, 'projects-list');
    }
}

// Fetch and display XP data
export async function fetchXPData(userId) {
    try {
        const data = await executeGraphQLQuery(XP_QUERY(userId));
        displayXPData(data.transaction_aggregate.aggregate.sum.amount);
        console.log(data.transaction_aggregate.aggregate.sum.amount);
    } catch (error) {
        handleError(error, 'xp-info');
    }
}

// Fetch and display audit ratio
export async function fetchAuditData() {
    try {
        const data = await executeGraphQLQuery(AUDIT_RATIO_QUERY);
        displayAuditRatio(data.user[0]);
        console.log(data.user[0]);
    } catch (error) {
        handleError(error, 'audit-ratio');
    }
}

// Fetch and display skills data
export async function fetchSkillsData() {
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

// Fetch and display tech skills in a bar chart
export async function fetchTechSkills() {
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
