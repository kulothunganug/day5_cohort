document.addEventListener('DOMContentLoaded', async () => {
    const user = await checkAuth();
    if (!user) return;
    
    const userNameEl = document.getElementById('user-name');
    if (userNameEl) userNameEl.textContent = `Hello, ${user.name}`;

    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('course_id');

    if (window.location.pathname.includes('student.html')) {
        loadAllCourses();
    } else if (window.location.pathname.includes('course.html') && courseId) {
        loadCourseDetails(courseId);
    }
});

async function loadAllCourses() {
    const list = document.getElementById('student-courses-list');
    list.innerHTML = 'Loading courses...';

    try {
        const courses = await apiRequest('/courses/');
        list.innerHTML = '';
        courses.forEach(course => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <h3>${course.title}</h3>
                <p>${course.description}</p>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem;">
                    <span>₹${course.price}</span>
                    <a href="course.html?course_id=${course.id}" class="btn btn-primary">View Details</a>
                </div>
            `;
            list.appendChild(card);
        });
    } catch (error) {
        list.innerHTML = 'Error loading courses.';
    }
}

async function loadCourseDetails(id) {
    const content = document.getElementById('course-details-content');
    try {
        const course = await apiRequest(`/courses/${id}`);
        content.innerHTML = `
            <h1>${course.title}</h1>
            <p>${course.description}</p>
        `;

        // Check if student is enrolled by attempting to fetch lessons
        try {
            const lessons = await apiRequest(`/courses/${id}/lessons/`);
            renderLessons(lessons);
            document.getElementById('purchase-overlay').classList.add('hidden');
        } catch (error) {
            // If 403 or unauthorized for lessons, show purchase
            document.getElementById('purchase-overlay').classList.remove('hidden');
            document.getElementById('buy-btn').onclick = () => initiatePayment(course);
        }
    } catch (error) {}
}

function renderLessons(lessons) {
    const list = document.getElementById('lessons-list');
    list.innerHTML = '';
    if (lessons.length === 0) {
        list.innerHTML = 'No lessons yet.';
        return;
    }

    lessons.sort((a, b) => a.order - b.order).forEach(lesson => {
        const item = document.createElement('div');
        item.style.padding = '0.5rem';
        item.style.borderBottom = '1px solid #eee';
        item.style.cursor = 'pointer';
        item.innerHTML = `<strong>${lesson.order}.</strong> ${lesson.title}`;
        item.onclick = () => playVideo(lesson.video_url);
        list.appendChild(item);
    });
}

function playVideo(url) {
    const container = document.getElementById('video-container');
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        let videoId = '';
        if (url.includes('v=')) {
            videoId = url.split('v=')[1].split('&')[0];
        } else {
            videoId = url.split('/').pop();
        }
        container.innerHTML = `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
    } else {
        container.innerHTML = `<video width="100%" height="100%" controls src="${url}"></video>`;
    }
}
