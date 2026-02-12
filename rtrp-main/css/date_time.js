function date_time(id) {
    date = new Date;
    year = date.getFullYear();
    month = date.getMonth();
    months = new Array('January', 'February', 'March', 'April', 'May', 'June', 'Jully', 'August', 'September', 'October', 'November', 'December');
    d = date.getDate();
    day = date.getDay();
    days = new Array('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday');
    h = date.getHours();
    if (h < 10) {
        h = "0" + h;
    }
    m = date.getMinutes();
    if (m < 10) {
        m = "0" + m;
    }
    s = date.getSeconds();
    if (s < 10) {
        s = "0" + s;
    }
    result = '[ ' + days[day] + ' ] ' + months[month] + ' ' + d + ', ' + year + ' ' + h + ':' + m + ':' + s;
    document.getElementById(id).innerHTML = result;
    setTimeout('date_time("' + id + '");', '1000');
    return true;
}


var script = document.createElement('script');
    script.type = 'text/javascript';

    script.src = 'http://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js';
    document.body.appendChild(script);
    function ShowProgress() {
        setTimeout(function () {
            var modal = $('<div />');
            modal.addClass("modal");
            $('body').append(modal);
            var loading = $(".loading");
            loading.show();
            var top = Math.max($(window).height() / 2 - loading[0].offsetHeight / 2, 0);
            var left = Math.max($(window).width() / 2 - loading[0].offsetWidth / 2, 0);
            loading.css({ top: top, left: left });
        }, 200);
    }
    $('form').live("submit", function () {
        ShowProgress();
    });


     function ShowProgressBar() {
         document.getElementById('dvProgressBar').style.visibility = 'visible';
     }

     function HideProgressBar() {
         document.getElementById('dvProgressBar').style.visibility = "hidden";
     }

     $(function () {
         $('a, button').click(function () {
             $(this).toggleClass('active');
         });
     });