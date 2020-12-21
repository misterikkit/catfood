function fillSchedule(schedule) {
    let view = $('#schedule');
    view.html('');
    schedule.forEach((t) => {
        let item = $(`<li><a href="#">${fmtTime(t)}</a><a href="#"></a></li>`);
        item.find('a').last()
            .attr('time', JSON.stringify(t))
            .click(editScheduleStart);
        view.append(item);
    });
    let add = $('<li data-icon="plus"><a href="#">add to the schedule</a></li>');
    add.find('a').click(addScheduleStart);
    view.append(add);
    view.listview('refresh');
}

function fmtTime(t) {
    let h = `${t.H}`;
    let m = `${t.M}`;
    // I hate that I have to do this
    if (h.length === 1) { h = '0' + h; }
    if (m.length === 1) { m = '0' + m; }
    return `${h}:${m}`
}

function handleError(err, st) {
    if (err.status === 403) {
        $('div[data-role="popup"]').popup('close')
        // Delay is needed for the popup to open
        window.setTimeout(() => { $('#forbidden').delay(50).popup('open'); }, 50);
    }
}

function editScheduleStart(e) {
    time = JSON.parse($(e.target).attr('time'))
    $('#editHour').val(time.H);
    $('#editMinute').val(time.M);
    $('#editOldHour').val(time.H);
    $('#editOldMinute').val(time.M);
    $('#editSchedule').popup('open');
}

function editScheduleSubmit() {
    console.log('Editing schedule')
    $.post('/config/schedule/edit', $('#editForm').serialize())
        .done(loadConfig)
        .done(() => { $('#editSchedule').popup('close'); })
        .fail(handleError);
    return false; // to prevent regular submission
}

function deleteScheduleSubmit() {
    console.log('Deleting from schedule')
    $.post('/config/schedule/delete', $('#editForm').serialize())
        .done(loadConfig)
        .done(() => { $('#editSchedule').popup('close'); })
        .fail(handleError);
    return false; // to prevent regular submission
}

function addScheduleStart() {
    $('#addHour').val('00');
    $('#addMinute').val('00');
    $('#addSchedule').popup('open');
}

function addScheduleSubmit() {
    console.log('Adding to schedule')
    $.post('/config/schedule/add', $('#addForm').serialize())
        .done(loadConfig)
        .done(() => { $('#addSchedule').popup('close'); })
        .fail(handleError);
    return false; // to prevent regular submission
}

function loadConfig() {
    console.log('Loading config')
    $.get('/config')
        .done((config) => {
            fillSchedule(config.schedule);
        })
        .fail(handleError);
}

function init() {
    loadConfig();
    $('#editSchedule').on('popupafterclose', () => {
        $('#confirmDelete').hide();
    });
    $('#confirmDelete').hide();

    $('#editDelete').click(() => {
        $('#confirmDelete').slideDown();
        return false;
    });

    $('#addSubmit').click(addScheduleSubmit);
    $('#editUpdate').click(editScheduleSubmit);
    $('#reallyConfirmDelete').click(deleteScheduleSubmit);
}

$(init);