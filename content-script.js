var timer
var delay = 600
var like_circle
var useful_bar
var easy_bar

$( () => {
    $('body').after("<div id='frame' class='loading'></div>");
    $('#frame').load(chrome.runtime.getURL("/html/hover.html"));
});


document.addEventListener('mouseover', (e) => {
    timer = setTimeout(() => {
        let srcElement = e.target;
        if (srcElement.nodeName == 'A' && srcElement.href.includes('ugradcalendar.uwaterloo.ca/courses/')) {

            $('#frame').css('display','block');
		    $('#frame').removeClass('info');
		    $('#frame').addClass('loading');
            $('#frame').css('left',e.pageX+'px');
            $('#frame').css('top',e.pageY+'px');

            let courseName = String(srcElement.href)
            let linkArray = courseName.split("/")
            courseName = (String(linkArray[linkArray.length - 2]).concat(String(linkArray[linkArray.length - 1]))).toLowerCase()
            console.log(courseName)
    
            fetch('https://uwflow.com/graphql', {
                method: 'POST',
                body: JSON.stringify(
                    {
                        "operationName": "getCourse",
                        "variables": {
                            "code": courseName,
                            "user_id": 0
                        },
                        "query": "query getCourse($code: String, $user_id: Int) {\n  course(where: {code: {_eq: $code}}) {\n    ...CourseInfo\n    ...CourseRating}\n}\n\nfragment CourseInfo on course {\n  id\n  code\n  name\n  description\n  __typename\n}\n\nfragment CourseRating on course {\n  id\n  rating {\n    liked\n    easy\n    useful\n    filled_count\n    comment_count\n    __typename\n  }\n  __typename\n}\n"
                    }
                )
            })
    
            .then(r => r.json())
            .then((data) => {
                if(data.data.course.length === 0) {
                    console.log("no course found")
                } else {
                    let courseData = data.data.course[0]
                    console.log(courseData)

                    try{
                        useful_bar.destroy()
                        easy_bar.destroy()
                        like_circle.destroy()
                    } catch(e) {
                        console.log(e)
                    }

                    $('#frame').removeClass('loading');
	                $('#frame').addClass('info');
                    $('#code').html(courseData.code.toUpperCase());
                    $('#code').attr("href", ("https://uwflow.com/course/" + courseName))
                    $('#name').html(courseData.name);
                    $('#description').html(courseData.description);
                    $('#useful').html(Math.round(courseData.rating.useful*100)+'%');
                    $('#easy').html(Math.round(courseData.rating.easy*100)+'%');
                    $('#liked').html(Math.round(courseData.rating.liked*100)+'%');

                    like_circle = new ProgressBar.Circle(liked_circle, {
                        strokeWidth: 12,
                        easing: 'easeInOut',
                        duration: 800,
                        color: "#0052cc",
                        trailColor: '#eee',
                        trailWidth: 3,
                        svgStyle: null
                    });

                    useful_bar = new ProgressBar.Line(useful_line, {
                        strokeWidth: 12,
                        easing: 'easeInOut',
                        duration: 800,
                        color: "#0052cc",
                        trailColor: '#eee',
                        trailWidth: 3,
                        svgStyle: {width: '100%', height: '100%'}
                    });

                    easy_bar = new ProgressBar.Line(easy_line, {
                        strokeWidth: 12,
                        easing: 'easeInOut',
                        duration: 800,
                        color: "#0052cc",
                        trailColor: '#eee',
                        trailWidth: 3,
                        svgStyle: {width: '100%', height: '100%'}
                    });
                      
                        useful_bar.animate(courseData.rating.useful)
                        easy_bar.animate(courseData.rating.easy)
                        like_circle.animate(courseData.rating.liked)
                }
            });
        }
    }, delay);
});

document.addEventListener('mouseout', (e) => {
    clearTimeout(timer)
    var divWidth = parseInt(window.getComputedStyle(document.getElementById('frame')).getPropertyValue('width'))
    var divHeight = parseInt(window.getComputedStyle(document.getElementById('frame')).getPropertyValue('height'))
    var divX = parseInt(window.getComputedStyle(document.getElementById('frame')).getPropertyValue('left'))
    var divY = parseInt(window.getComputedStyle(document.getElementById('frame')).getPropertyValue('top'))
    if(divX - 20 > e.pageX || e.pageX > divX + divWidth + 20
        || divY - 20 > e.pageY || e.pageY > divY + divHeight + 20) {
        $('#frame').css('display','none')
    }
});