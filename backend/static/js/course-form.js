const urlParams = new URLSearchParams(window.location.search);
const courseId = urlParams.get('course_id');
const isEditMode = !!courseId;

document.addEventListener('DOMContentLoaded', async () => {
    const user = await checkAuth();
    if (user && user.role !== 'instructor') {
        window.location.href = 'student.html';
        return;
    }
    document.getElementById('user-name').textContent = `Hello, ${user.name}`;

    updateUIForMode();

    if (isEditMode) {
        loadCourseData();
        loadLessons();
    }

    const courseForm = document.getElementById('course-form');
    courseForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            title: document.getElementById('title').value,
            description: document.getElementById('description').value,
            price: parseInt(document.getElementById('price').value)
        };

        try {
            if (isEditMode) {
                await apiRequest(`/courses/${courseId}`, 'PUT', payload);
                showToast('Course updated successfully!');
            } else {
                const response = await apiRequest('/courses/', 'POST', payload);
                showToast('Course created successfully!');
                // Redirect to edit mode for the new course
                setTimeout(() => {
                    window.location.href = `course-form.html?course_id=${response.id}`;
                }, 1000);
            }
        } catch (error) {
            showToast(`Failed to ${isEditMode ? 'update' : 'create'} course.`);
        }
    });

    const lessonForm = document.getElementById('add-lesson-form');
    lessonForm.addEventListener('submit', async (e) => {
        e.preventDefault();
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
            loadLessons();
        } catch (error) {
            showToast('Failed to add lesson.');
        }
    });
});

function updateUIForMode() {
    const heading = document.getElementById('page-heading');
    const submitBtn = document.getElementById('submit-btn');
    const lessonsCard = document.getElementById('lessons-card');

    if (isEditMode) {
        heading.textContent = 'Edit Course';
        submitBtn.textContent = 'Update Course';
        lessonsCard.classList.remove('hidden');
    } else {
        heading.textContent = 'Create New Course';
        submitBtn.textContent = 'Create Course';
        lessonsCard.classList.add('hidden');
    }
}

async function loadCourseData() {
    try {
        const course = await apiRequest(`/courses/${courseId}`);
        document.getElementById('title').value = course.title;
        document.getElementById('description').value = course.description;
        document.getElementById('price').value = course.price;
    } catch (error) {
        showToast('Error loading course data.');
    }
}

async function loadLessons() {
    const tbody = document.getElementById('lessons-tbody');
    tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 1rem;">Loading lessons...</td></tr>';

    try {
        const lessons = await apiRequest(`/courses/${courseId}/lessons/`);
        tbody.innerHTML = '';
        if (lessons.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 1rem; color: var(--text-muted);">No lessons added yet.</td></tr>';
            return;
        }

        lessons.sort((a, b) => a.order - b.order).forEach(lesson => {
            renderLessonRow(lesson);
        });
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 1rem; color: var(--error);">Error loading lessons.</td></tr>';
    }
}

function renderLessonRow(lesson) {
    const tbody = document.getElementById('lessons-tbody');
    const tr = document.createElement('tr');
    tr.style.borderBottom = '1px solid var(--border)';
    tr.dataset.lessonId = lesson.id;
    
    tr.innerHTML = `
        <td style="padding: 0.5rem;"><input type="number" class="order-input" value="${lesson.order}" style="width: 60px;"></td>
        <td style="padding: 0.5rem;"><input type="text" class="title-input" value="${lesson.title}" placeholder="Lesson Title"></td>
        <td style="padding: 0.5rem;"><input type="url" class="url-input" value="${lesson.video_url}" placeholder="YouTube URL"></td>
        <td style="padding: 0.5rem; text-align: right;">
            <button onclick="updateLesson(${lesson.id}, this)" class="btn btn-primary btn-sm" style="padding: 0.25rem 0.5rem;">Save</button>
            <button onclick="deleteLesson(${lesson.id}, this)" class="btn btn-outline btn-sm" style="padding: 0.25rem 0.5rem; border-color: var(--error); color: var(--error);">Delete</button>
        </td>
    `;
    tbody.appendChild(tr);
}

function addEmptyLessonRow() {
    if (!isEditMode) {
        showToast('Please save the course details first.');
        return;
    }
    const tbody = document.getElementById('lessons-tbody');
    // Remove "No lessons" message if exists
    if (tbody.innerHTML.includes('No lessons added yet')) {
        tbody.innerHTML = '';
    }

    const tr = document.createElement('tr');
    tr.style.borderBottom = '1px solid var(--border)';
    tr.innerHTML = `
        <td style="padding: 0.5rem;"><input type="number" class="order-input" value="${tbody.children.length + 1}" style="width: 60px;"></td>
        <td style="padding: 0.5rem;"><input type="text" class="title-input" value="" placeholder="New Lesson Title"></td>
        <td style="padding: 0.5rem;"><input type="url" class="url-input" value="" placeholder="YouTube URL"></td>
        <td style="padding: 0.5rem; text-align: right;">
            <button onclick="saveNewLesson(this)" class="btn btn-primary btn-sm" style="padding: 0.25rem 0.5rem;">Create</button>
            <button onclick="this.closest('tr').remove()" class="btn btn-outline btn-sm" style="padding: 0.25rem 0.5rem;">Cancel</button>
        </td>
    `;
    tbody.appendChild(tr);
}

async function saveNewLesson(btn) {
    const tr = btn.closest('tr');
    const payload = {
        title: tr.querySelector('.title-input').value,
        video_url: tr.querySelector('.url-input').value,
        order: parseInt(tr.querySelector('.order-input').value)
    };

    if (!payload.title || !payload.video_url) {
        showToast('Title and URL are required.');
        return;
    }

    try {
        await apiRequest(`/courses/${courseId}/lessons/`, 'POST', payload);
        showToast('Lesson created!');
        loadLessons();
    } catch (error) {
        showToast('Failed to create lesson.');
    }
}

async function updateLesson(id, btn) {
    const tr = btn.closest('tr');
    const payload = {
        title: tr.querySelector('.title-input').value,
        video_url: tr.querySelector('.url-input').value,
        order: parseInt(tr.querySelector('.order-input').value)
    };

    try {
        // Backend currently defines LessonUpdate in schemas.py. Let's assume it supports these fields.
        await apiRequest(`/courses/lessons/${id}`, 'PUT', payload);
        showToast('Lesson updated!');
    } catch (error) {
        showToast('Failed to update lesson.');
    }
}

async function deleteLesson(id, btn) {
    if (!confirm('Are you sure you want to delete this lesson?')) return;

    try {
        await apiRequest(`/courses/lessons/${id}`, 'DELETE');
        showToast('Lesson deleted!');
        btn.closest('tr').remove();
    } catch (error) {
        showToast('Failed to delete lesson.');
    }
}

function closeModal(id) {
    // Legacy support if needed, but we removed the modal
}
