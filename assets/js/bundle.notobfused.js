document.persistentToast = null

const PersistentToast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 0
})

const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
})

function makeid(length) {
    var result = '';
    var characters = 'abcde0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function randomUID() {
    // 053d44dd-430c-4e4b-9a2a-95e0e1614856
    return `${makeid(8)}-${makeid(4)}-${makeid(4)}-${makeid(4)}-${makeid(12)}`
}

function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function msToDate(ms) {
    const date = new Date(ms);
    const days = date.getUTCDate() - 1,
    hours = date.getUTCHours(),
    minutes = date.getUTCMinutes(),
    seconds = date.getUTCSeconds();
    let segments = [];
    if (days > 0) segments.push(days + (days > 1 ? " Days" : " Day"));
    if (hours > 0) segments.push(hours + (days > 1 ? " Hours" : " Hour"));
    if (minutes > 0) segments.push(minutes + (days > 1 ? " Minutes" : " Minute"));
    if (seconds > 0) segments.push(seconds + (days > 1 ? " Seconds" : " Second"));
    const dateString = segments.join(" ");

    return dateString
}

function msToTime(s) {
    // Pad to 2 or 3 digits, default is 2
    function pad(n, z) {
        z = z || 2;
        return ('00' + n).slice(-z);
    }

    var ms = s % 1000;
    s = (s - ms) / 1000;
    var secs = s % 60;
    s = (s - secs) / 60;
    var mins = s % 60;
    var hrs = (s - mins) / 60;

    return pad(hrs) + ':' + pad(mins) + ':' + pad(secs);
}

function appendQNA(data) {
    $('#qna').html('')
    let htmlHeader = `
        <hr>
        <div id="header-qna">
            <div class="container-fluid bg-dark py-3">
                <div class="row">
                    <div class="col-md-6 mx-auto">
                        <div class="card text-center">
                            <div class="card-header">
                                <h3>${data.title}</h3>
                                <p>${data.description}</p>
                            </div>
                            ${data.image ? `<div class="card-body"><img src="${data.image}" class="card-img-top embed-responsive-item"></div>` : ''}
                            <div class="card-footer text-muted card-img-top">
                                <div class="float-start">
                                    Open for : ${msToDate(data.time)}
                                </div>
                                <div class="float-end">
                                    ${data.owner}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`
    $('#qna').append(htmlHeader)
    for (let questions of data.questions) {
        let html = `
        <div id="answers">
            <div class="container-fluid bg-dark py-3">
                <div class="row">
                    <div class="col-md-6 mx-auto">
                        <div class="card text-center">
                            <div class="card-header">
                                <div class="float-start">
                                    ${questions.type}
                                </div>
                                <div class="float-end">
                                    ${msToTime(questions.time)}
                                </div>
                            </div>
                            <div class="card-body">
                                <img src="${questions.image ? questions.image : ''}" class="card-img-top embed-responsive-item">
                                <p>${questions.question}</p>
                                <div class="row d-flex p-2 bd-highlight">`
                                for (let option of questions.choices) {
                                    if (option.correct) {
                                        html += `
                                        <div class="mb-3 d-flex justify-content-center align-items-center rounded bg-success text-white" style="height: 100px;">
                                            ${option.answer}
                                        </div>`
                                        } else {
                                            html += `
                                        <div class="mb-3 d-flex justify-content-center align-items-center rounded bg-danger text-white" style="height: 100px;">
                                            ${option.answer}
                                        </div>`
                                    }
                                }
                                html += `
                            </div>
                            <div class="card-footer text-muted card-img-top">
                                Resource : ${questions.resources || '-'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `
        $('#qna').append(html)
    }
}

function parseKahoot() {
    let pin = $('#_data').val()
    document.persistentToast = PersistentToast.fire(
        'Processing...',
        'Crawling Request.',
        'info'
    )
    let apiUrl = `/getMetadata?pin=${pin}`
    let data = {}
    $.getJSON(apiUrl, (json) => {
        if (json.error) {
            Toast.fire(
                'Error when getting metadata!',
                json.error,
                'warning'
            )
            return
        }
        data.title = json.kahoot.title
        data.description = json.kahoot.description
        data.owner = json.kahoot.creator_username
        data.image = 'https://images-cdn.kahoot.it/' + json.challenge.cover.id
        data.time = json.challenge.endTime - json.challenge.startTime
        data.questions = json.kahoot.questions
        console.log(data)
        document.persistentToast.close()
        appendQNA(data)
        Toast.fire(
            'Success',
            `Success Scraping Answers!`,
            'success'
        )
    })
    .fail(function () {
        Toast.fire(
            'Failed!',
            'Cannot find data on that url.',
            'warning'
        )
    })
}