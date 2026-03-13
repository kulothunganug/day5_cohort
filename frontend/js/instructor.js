document.addEventListener('DOMContentLoaded', async () => {
    const user = await checkAuth();
    if (user && user.role !== 'instructor') {
        window.location.href = 'student.html';
        return;
    }
    document.getElementById('user-name').textContent = `Hello, ${user.name}`;

    loadInstructorCourses();

    const createForm = document.getElementById('create-course-form');
    createForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            title: document.getElementById('title').value,
            description: document.getElementById('description').value,
            price: parseInt(document.getElementById('price').value)
        };

        try {
            await apiRequest('/courses/', 'POST', payload);
            showToast('Course created successfully!');
            createForm.reset();
            loadInstructorCourses();
        } catch (error) {}
    });

    const lessonForm = document.getElementById('add-lesson-form');
    lessonForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const courseId = document.getElementById('modal-course-id').value;
        const payload = {
            title: document.getElementById('lesson-title').value,
            video_url: document.getElementById('video-url').value,
            order: parseInt(document.getElementById('order').value)
        };

        try {
            await apiRequest(`/courses/${courseId}/lessons/`, 'POST', payload);
            showToast('Lesson added successfully!');
            closeModal('lesson-modal');
            lessonForm.reset();
        } catch (error) {}
    });

    const liveForm = document.getElementById('create-live-form');
    liveForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const courseId = document.getElementById('live-course-id').value;
        const payload = {
            course_id: parseInt(courseId),
            topic: document.getElementById('live-topic').value,
            description: document.getElementById('live-desc').value,
            scheduled_at: new Date(document.getElementById('scheduled-at').value).toISOString()
        };

        try {
            await apiRequest('/live-classes/', 'POST', payload);
            showToast('Live class scheduled!');
            closeModal('live-modal');
            liveForm.reset();
        } catch (error) {}
    });
});

async function loadInstructorCourses() {
    const list = document.getElementById('courses-list');
    list.innerHTML = 'Loading courses...';

    try {
        const courses = await apiRequest('/courses/');
        // Backend doesn't have an owner filter yet, so we'll show all and then in a real app filter by instructor_id
        // For this demo, we assume all listed are owned or the user doesn't care.

        list.innerHTML = '';
        courses.forEach(course => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <h3>${course.title}</h3>
                <p>${course.description}</p>
                <p><strong>Price:</strong> ₹${course.price}</p>
                <div style="display: flex; gap: 0.5rem; margin-top: 1rem; flex-wrap: wrap;">
                    <button onclick="openLessonModal(${course.id}, '${course.title}')" class="btn btn-outline btn-sm">Add Lesson</button>
                    <button onclick="openLiveModal(${course.id})" class="btn btn-outline btn-sm">Schedule Live</button>
                    <a href="live.html?course_id=${course.id}" class="btn btn-primary btn-sm">Join Chat</a>
                </div>
            `;
            list.appendChild(card);
        });
    } catch (error) {
        list.innerHTML = 'Error loading courses.';
    }
}

function openLessonModal(id, title) {
    document.getElementById('modal-course-id').value = id;
    document.getElementById('modal-course-title').textContent = title;
    document.getElementById('lesson-modal').classList.remove('hidden');
}

function openLiveModal(id) {
    document.getElementById('live-course-id').value = id;
    document.getElementById('live-modal').classList.remove('hidden');
}

function closeModal(id) {
    document.getElementById(id).classList.add('hidden');
}
