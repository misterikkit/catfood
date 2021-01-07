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

function fillProgram(program) {
    let view = $('#program');
    view.html('');
    program.map((step) => {
        let item = makeProgramRow();
        if (step.direction === 'FWD') {
            item.find('input[type="checkbox"]').prop('checked', true);
        }
        item.find('input[type="number"]').val(step.amount);
        item.find('a').click((e) => { $(e.target).closest('li').remove(); })
        view.append(item);
    })
    let add = $('<li data-icon="plus"><a href="#">add a step</a></li>');
    add.find('a').click(() => {
        makeProgramRow().insertBefore(add);
        view.listview('refresh');
        view.enhanceWithin();
    });
    view.append(add);
    try {
        view.listview('refresh');
        view.enhanceWithin();
    }

    catch (e) {
        console.log('error refreshing program listview', e);
    }
}

function makeProgramRow() {
    const direction = $('<input type="checkbox" data-role="flipswitch" data-on-text="fwd" data-off-text="rev" data-wrapper-class="custom-label-flipswitch" />');
    const amount = $('<input type="number" name="amount"/>');
    const del = $('<a href="#" data-role="button" data-icon="delete" data-iconpos="notext">delete</a>');
    return $('<li></li>').append(
        $('<fieldset></fieldset').addClass('ui-grid-b').append(
            $('<div></div>').addClass('ui-block-a').css({ width: '40%' }).append(direction),
            $('<div></div>').addClass('ui-block-b').css({ width: '45%' }).append(amount),
            $('<div></div>').addClass('ui-block-c').css({ width: '15%' }).append(del)
        )
    );
}

function editProgramSubmit() {
    console.log('Updating program');
    const form = $('#programForm');
    // Make unchecked check boxes explicit.
    form.find('input[type="checkbox"]').each((i, box) => {
        const dir = $(box).prop('checked') ? 'FWD' : 'REV';
        form.append($(`<input type="hidden" name="direction" value="${dir}">`));
    })
    $.post('/config/program', $('#programForm').serialize())
        .done(loadConfig)
        .fail(handleError);
    $.mobile.navigate('#main');
    return false; // to prevent regular submission
}

function editProgramCancel() {

}

function fmtTime(t) {
    let h = `${t.H}`;
    let m = `${t.M}`;
    // I hate that I have to do this
    if (h.length === 1) { h = '0' + h; }
    if (m.length === 1) { m = '0' + m; }
    return `${h}:${m}`
}

function handleError(err) {
    console.error(err);
    // Pick which error popup.
    let popupID = '#uhoh';
    switch (err.status) {
        case 401:
            popupID = '#unauthorized'
            break;
        case 403:
            popupID = '#forbidden';
            break;
        case 429:
            popupID = '#ratelimit';
            break;
    }
    // If needed, close the current popup and wait for its transition.
    if ($.mobile.popup.active) {
        $.mobile.popup.active.element.one('popupafterclose', () => {
            $(popupID).popup('open');
        });
        $.mobile.popup.active.close();
    } else {
        $(popupID).popup('open');
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
            fillProgram(config.program);
        })
        .fail(handleError);
}

function feedCatNow() {
    console.log('Feeding the cat');
    $.post('/feedcatnow')
        .done(() => {
            $('#btn-feed').text('😻 You fed the cat! 😻');
            setTimeout(() => {
                $('#btn-feed').text($('#btn-feed').attr('origText'));
            }, 5000);
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
    $('#btn-feed').attr('origText', $('#btn-feed').text());
    $('#btn-feed').click(feedCatNow);
    $('#programSubmit').click(editProgramSubmit);
    $('#programCancel').click(editProgramCancel);
    $('#signInBtn').click(() => {
        $('#unauthorized').popup('close');
        google.accounts.id.prompt();
    })
}

$(init);