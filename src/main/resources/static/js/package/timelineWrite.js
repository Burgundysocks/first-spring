$(document).ready(function() {
	const dayLocations = {};
	let geocoder = new google.maps.Geocoder();
	let body_markers = [];
	let polyline = null;
	let modal = $("#modal");
	let contentModal = $("#contentModal");
	let span = $(".close");
	let map;
	let input;
	let searchBox;
	let marker = null; // 단일 마커를 저장할 변수
	const defaultLocationName = $('.region_name span').text(); //리전네임 받아서 하는게 안전
	let body_map;	
	
	$("#package_regist").click(function(){
		window.location.href = '/package/packageVisibility?packagenum=' + packagenum;
	})
	
	$("#deleteAllTimeline").click(function(){
		showAlertModal(98,"지금까지 작성한 타임라인을 전부 삭제하시겠습니까?");
	})
	$(document).on("click", "#deleteAllTimelineBtn", function(){
		timelineService.deleteAll(
			{"packagenum":packagenum},
			function(result){
				$(this).remove();
				alertModal.hide();
				for(i=1;i<=days;i++){
				    showDayList(packagenum,i);		
				}
			}
		)
	})
	
    for(i=1;i<=days;i++){
	    showDayList(packagenum,i);		
	}
  	let thisClickDay = 0;
    //썸머노트 여는버튼 day랑 detail_num이랑 쓰여있는 장소 불러와야함
    $(document).on("click", ".add_picture_btn", function(){
		let dayDetailBoxId = $(this).closest('.day_detail_box').attr('id');
	    thisClickDay = dayDetailBoxId.split('-')[0];
	    let thisDetailNum = dayDetailBoxId.split('-')[1];
	    let placeNameText = $(this).closest('.day_detail_box').find('.place_name').text();
        contentModal.show();
        $(".McDetail_place p").text(placeNameText);
        $("this_day coqSbM").text("Day"+thisClickDay);
        $(".McDetail_num p span").text(thisDetailNum);
        timelineService.getContent(
			{"packagenum":packagenum,"day":thisClickDay,"detailNum":thisDetailNum},
			function(result){
				$("#summernote").summernote("code",result.contents);
			}
		)
    })

    //썸머노트 취소버튼클릭
    $(document).on("click", "#cancelButton", function(){
        contentModal.hide();
    })
    
    //썸머노트 작성버튼 클릭시
    $(document).on("click", "#submitButton", function(){
	    let thisDay = thisClickDay;
	    let thisDetailNum = $(".McDetail_num p span").text();
	    let contents = $("#summernote").summernote("code");
	    console.log("들어왔나요?")
	    console.log(thisDay)
	    console.log(thisDetailNum)
	    console.log(contents)
        timelineService.updateContents(
			{"packagenum":packagenum,"day":thisDay,"detailNum":thisDetailNum,"contents":contents},
			function(result){
				console.log(result);
			}
		)
        contentModal.hide();
    })

    //썸머노트 설정값
    $('#summernote').summernote({        
        codeviewFilter: false, // 코드 보기 필터 비활성화
            codeviewIframeFilter: false, // 코드 보기 iframe 필터 비활성화
            lang: 'ko-KR',
            placeholder: '장소의 사진이나 메모를 작성하세요',
            width: 1000,
            maxWidth: 1000,
            height: 500,
            maxHeight: 500,
            focus : true,
            toolbar: [
                ['style', ['style']], // 글자 스타일 설정 옵션
                ['fontsize', ['fontsize']], // 글꼴 크기 설정 옵션
                ['fontname', ['fontname']],
                ['font', ['bold', 'underline', 'clear']], // 글자 굵게, 밑줄, 포맷 제거 옵션
                ['color', ['color']], // 글자 색상 설정 옵션
                ['table', ['table']], // 테이블 삽입 옵션
                ['para', ['ul', 'ol', 'paragraph']], // 문단 스타일, 순서 없는 목록, 순서 있는 목록 옵션
                ['height', ['height']], // 에디터 높이 조절 옵션
                ['insert', ['link', 'video']], // 이미지 삽입, 링크 삽입, 동영상 삽입 옵션
                ['view', ['codeview', 'fullscreen', 'help']], // 코드 보기, 전체 화면, 도움말 옵션
            ],
            fontNames: ['Arial', 'Arial Black', 'Comic Sans MS', 'Courier New','맑은 고딕','궁서','굴림체','굴림','돋움체','바탕체','Nanum Gothic'],
            fontSizes: [
                '8', '9', '10', '11', '12', '14', '16', '18',
                '20', '22', '24', '28', '30', '36', '50', '72',
            ], // 글꼴 크기 옵션
            styleTags: [
                'p',  // 일반 문단 스타일 옵션
                {
                    title: 'Blockquote',
                    tag: 'blockquote',
                    className: 'blockquote',
                    value: 'blockquote',
                },  // 인용구 스타일 옵션
                'pre',  // 코드 단락 스타일 옵션
                {
                    title: 'code_light',
                    tag: 'pre',
                    className: 'code_light',
                    value: 'pre',
                },  // 밝은 코드 스타일 옵션
                {
                    title: 'code_dark',
                    tag: 'pre',
                    className: 'code_dark',
                    value: 'pre',
                },  // 어두운 코드 스타일 옵션
                'h1', 'h2', 'h3', 'h4', 'h5', 'h6',  // 제목 스타일 옵션
            ],
         callbacks: {
            onImageUpload: function (files) {
               uploadSummernoteImageFile(files[0],this);
            },
            onMediaDelete: function ($target, editor, $editable) {
                if (confirm('이미지를 삭제 하시겠습니까?')) {
                    var deletedImageUrl = $target
                        .attr('src')
                        .split('/')
                        .pop()
                    // ajax 함수 호출
                    deleteSummernoteImageFile(deletedImageUrl)
                }
            },
        },
    });

    //마우스 올릴때 위치 이동
    $(document).on("mouseenter", ".day_detail_box", function() {
        thisDay = $(this).attr("id").split("-")[0];
        thisPlace = $(this).attr("id").split("-")[1];
        this_Place_Distance = dayLocations[thisDay][thisPlace-1];
        latitude = this_Place_Distance.lat;
        longitude = this_Place_Distance.lng;
        showDay(thisDay);
        centerLatLng = new google.maps.LatLng(latitude, longitude);
        body_map.setCenter(centerLatLng);
    });

    //삭제구현
    $(document).on("click", ".delete_btn", function(){
	   let dayDetailBoxId = $(this).closest('.day_detail_box').attr('id');
	   let thisDay = dayDetailBoxId.split('-')[0];
	   let thisDetailNum = dayDetailBoxId.split('-')[1];
	   console.log(packagenum+"+"+thisDay+"+"+thisDetailNum);
       timelineService.delete(
			{"packagenum":packagenum,"day":thisDay,"detailNum":thisDetailNum},
			function(result){
				console.log(result);
				showDayList(packagenum, thisDay);
			}
		)
    })

    geocodeAndInitMap(defaultLocationName);
    function initMap(location) {
        map = new google.maps.Map(document.getElementById('map'), {
            center: location,
            zoom: 11
        });

        input = document.getElementById('pac-input');
        searchBox = new google.maps.places.SearchBox(input);

        map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

        map.addListener('bounds_changed', function() {
            searchBox.setBounds(map.getBounds());
        });

        searchBox.addListener('places_changed', function() {
            var places = searchBox.getPlaces();

            if (places.length == 0) {
                return;
            }

            // 기존 마커 제거
            if (marker) {
                marker.setMap(null);
            }

            var bounds = new google.maps.LatLngBounds();
            var place = places[0]; // 첫 번째 장소만 사용

            if (!place.geometry) {
                return;
            }

            // 새로운 마커 생성 및 설정
            marker = new google.maps.Marker({
                map: map,
                title: place.name,
                position: place.geometry.location
            });

            $('#description').text(place.formatted_address);
            if($('#description').text() !== ""){
                $('.place_select_btn').addClass('on');
            }else{
                $('.place_select_btn').removeClass('on');
            }

            if (place.geometry.viewport) {
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }

            map.fitBounds(bounds);
        });

        // 클릭 이벤트 추가
        map.addListener('click', function(event) {
            // 새로운 클릭 지점의 위도와 경도
            var clickedLocation = event.latLng;
            
            // 기존 마커 제거
            if (marker) {
                marker.setMap(null);
            }

            // 새로운 마커 생성
            marker = new google.maps.Marker({
                position: clickedLocation,
                map: map
            });

            // 마커 위치를 주소로 변환하여 표시
            geocoder.geocode({ 'location': clickedLocation }, function(results, status) {
                if (status === 'OK') {
                    if (results[0]) {
                        $('#description').text(results[0].formatted_address);
                        $('.place_select_btn').addClass('on');
                    } else {
                        window.alert('No results found');
                    }
                } else {
                    window.alert('Geocoder failed due to: ' + status);
                }
            });
        });
    }

    function geocodeLocation(locationName) {
        geocoder.geocode({ 'address': locationName }, function(results, status) {
            if (status === 'OK') {
                if (!map) {
                    initMap(results[0].geometry.location);
                } else {
                    map.setCenter(results[0].geometry.location);
                }
            } else {
                alert('Geocode was not successful for the following reason: ' + status);
            }
        });
    }

    function resetMapAndControls() {
        if (input) {
            input.value = '';
        }
        $('#description').text('');

        // 기존 마커 제거
        if (marker) {
            marker.setMap(null);
            marker = null;
        }

        if (map && searchBox) {
            searchBox.setBounds(map.getBounds());
            google.maps.event.trigger(map, 'resize');
            map.setCenter(map.getCenter());
        }
        geocodeLocation(defaultLocationName);
    }

  	let clickDay = "";
    $(document).on("click", ".place_btn", function() {
        clickDay = $(this).attr("id").substring(12);
        console.log(clickDay);

        modal.show();
        if (!map) {
            geocodeLocation(defaultLocationName);
        } else {
            google.maps.event.trigger(map, 'resize');
            map.setCenter(map.getCenter());
        }

        span.on("click", function() {
            resetMapAndControls();
            modal.hide();
        });
    
        $(window).on("click", function(event) {
            if ($(event.target).is(modal)) {
                resetMapAndControls();
                modal.hide();
            }
        });
    });
    
    //지역 고르고 추가시
    $('.place_select_btn').on("click", function(){
        place_name2 = $('#description').text();
        console.log(dayLocations);
        let clickedDay = clickDay;
		let last_num = (dayLocations[clickDay] && dayLocations[clickDay].length > 0) 
						? dayLocations[clickDay].length + 1 : 1;
		timelineService.insert(
			{"packagenum":packagenum,"day":clickedDay,"detailNum":last_num,"title":place_name2},
			function(result){
				showDayList(packagenum,clickedDay);
			}
		)
        resetMapAndControls();
        modal.hide();
        
        $('#description').text();
        $('.place_select_btn').removeClass('on');
    })
    
    //삭제 구현해야함 dayLocations에서 제거, 선 제거
    //큰 지도 구현
    $("#removeMarkerBtn").click(function() {
        const markerIndex = parseInt($("#markerIndexInput").val());
        const chooseDay = parseInt($("#chooseDay").val());
        console.log("선택날짜 : "+chooseDay+" 선택마커번호 : "+markerIndex);
        removeMarker(chooseDay, markerIndex-1);
    });
    
    function geocodeAndInitMap(locationName) {
        geocoder.geocode({ 'address': locationName }, function(results, status) {
            if (status === 'OK') {
                if (!body_map) {
                    body_initMap(results[0].geometry.location);
                } else {
                    body_map.setCenter(results[0].geometry.location);
                }
            } else {
                alert('Geocode was not successful for the following reason: ' + status);
            }
        });
    }

    function body_initMap(centerLocation) {
        body_map = new google.maps.Map(document.getElementById("body_map"), {
            center: centerLocation,
            zoom: 11,
        });
    }

    for (let i = 1; i <= days; i++) {
        $("#day" + i).mouseenter(function() {
            showDay(i);
        });
        $(".day" + i).mouseenter(function() {
            showDay(i);
        });
    }

    function removeMarker(day, markerIndex) {
        if (dayLocations[day] && dayLocations[day][markerIndex]) {
            // dayLocations에서 삭제
            dayLocations[day].splice(markerIndex, 1);
            // 지도에서 마커 제거
            body_markers[markerIndex].setMap(null);
            // body_markers에서 삭제
            body_markers.splice(markerIndex, 1);
            // 남아있는 마커 업데이트
            console.log(dayLocations);
            showDay(day);
        } else {
            alert("잘못된 마커 인덱스");
        }
    }

	async function showDayList(packagenum, day) {
    dayLocations[day] = [];
    $("#day" + day + "-list").empty();
    timelineService.get(
        {"packagenum": packagenum, "day": day},
        async function(result) {
            if (result == null) {
                return;
            }
            result.sort((a, b) => a.detailNum - b.detailNum);
            for (let i = 0; i < result.length; i++) {
                const item = result[i];
                geocodeLocationAndAddToDay(item.day, item.title);
                let add_place_dom = generatePlaceDOM(item.title, item.day, item.detailNum);
                if (item.detailNum == 1) {
                    $("#day" + day + "-list").append(add_place_dom);
                } else {
                    const previousItem = result[i - 1];
                    try {
                        const distance = await getDistanceAsync(item.title, previousItem.title);
                        console.log(distance);
                        let add_place_between = generatePlaceBetweenDOM(distance.toFixed(2));
                        $("#day" + day + "-list").append(add_place_between);
                        $("#day" + day + "-list").append(add_place_dom);
                    } catch (error) {
                        console.error(error);
                    }
                }
            };
        }
    )
}
	
	//사이 선 dom
	function generatePlaceBetweenDOM(distance) {
	    return `<div class="detail_between">
		    <div>
		        <div></div>
		        <div></div>
		        <div></div>
		    </div>
		    <div>
		        <span>${distance}km</span>
		    </div>
		</div>`;
	}
	
	//장소 추가 했을 시 dom
	function generatePlaceDOM(pn, d, ln) { 
	    let pnum = 0;
	    if(ln <= 3){
	        pnum = ln;
	    }else{
	        pnum = ((ln - 1) % 3) + 1;
	    }
	    return `<div class="day_detail_box" id="${d}-${ln}">
	        <div class="day_detail">
	            <div class="detail_num">
	                <div class="p${pnum}">${ln}</div>
	            </div>
	            <div class="detail_place">
	                <div class="place_name">${pn}</div>
	                <div class="btn_area">
	                    <div class="add_picture_btn" style="cursor: pointer;">
	                        <svg width="24" height="24" viewBox="0 0 24 24" fill="#64B5F6" xmlns="http://www.w3.org/2000/svg"><path d="M15.2936 3.18393C15.8722 2.60536 16.8102 2.60536 17.3888 3.18393L19.1024 4.89757L20.8161 6.61121C21.3946 7.18979 21.3946 8.12784 20.8161 8.70642L9.6872 19.8353L10.2175 20.3656L9.6872 19.8353C9.48797 20.0345 9.23605 20.1728 8.96099 20.2339L4.55449 21.2132C3.49593 21.4484 2.55161 20.5041 2.78684 19.4455L3.76607 15.039C3.82719 14.764 3.96548 14.512 4.16472 14.3128L15.2936 3.18393Z" stroke="#1F2023" stroke-width="1.5" stroke-linecap="round"/></svg>
	                    </div>
	                    <div class="delete_btn">
	                        <svg width="20" height="20" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg" style="cursor: pointer;">
	                            <path fill-rule="evenodd" clip-rule="evenodd" d="M5.5 5.08325C4.39543 5.08325 3.5 5.97868 3.5 7.08325V13.9166C3.5 15.0212 4.39543 15.9166 5.5 15.9166H11.5C12.6046 15.9166 13.5 15.0212 13.5 13.9166V7.08325C13.5 5.97868 12.6046 5.08325 11.5 5.08325H5.5ZM6 7.61108C5.65482 7.61108 5.375 7.89091 5.375 8.23608V12.7639C5.375 13.109 5.65482 13.3889 6 13.3889C6.34518 13.3889 6.625 13.109 6.625 12.7639V8.23608C6.625 7.89091 6.34518 7.61108 6 7.61108ZM7.875 8.23608C7.875 7.89091 8.15482 7.61108 8.5 7.61108C8.84518 7.61108 9.125 7.89091 9.125 8.23608V12.7639C9.125 13.109 8.84518 13.3889 8.5 13.3889C8.15482 13.3889 7.875 13.109 7.875 12.7639V8.23608ZM11 7.61108C10.6548 7.61108 10.375 7.89091 10.375 8.23608V12.7639C10.375 13.109 10.6548 13.3889 11 13.3889C11.3452 13.3889 11.625 13.109 11.625 12.7639V8.23608C11.625 7.89091 11.3452 7.61108 11 7.61108Z" fill="#FC7070"></path><rect x="3.5" y="2.5" width="10" height="1.5" rx="0.75" fill="#FC7070"></rect><rect x="6.5" y="1.5" width="4" height="2" rx="1" fill="#FC7070"></rect>
	                        </svg>
	                    </div>
	                </div>
	            </div>
	        </div>
	    </div>`;
	}
	
	function getDistanceAsync(place1, place2) {
    return new Promise((resolve, reject) => {
        var geocoder = new google.maps.Geocoder();
        
        geocoder.geocode({ 'address': place1 }, function(results, status) {
            if (status === 'OK') {
                var location1 = results[0].geometry.location;
                
                geocoder.geocode({ 'address': place2 }, function(results, status) {
                    if (status === 'OK') {
                        var location2 = results[0].geometry.location;
                        
                        var distance = google.maps.geometry.spherical.computeDistanceBetween(location1, location2) / 1000; // km
                        resolve(distance);
                    } else {
                        console.error('Geocode was not successful for the following reason: ' + status);
                        reject(new Error('Geocode failed for place2'));
                    }
                });
            } else {
                console.error('Geocode was not successful for the following reason: ' + status);
                reject(new Error('Geocode failed for place1'));
            }
        });
    });
}

	// day와 지역 이름을 받아 좌표를 저장하는 함수
	function geocodeLocationAndAddToDay(day, locationName) {
	    geocoder.geocode({ 'address': locationName }, function(results, status) {
	        if (status === 'OK') {
	            const location = {
	                lat: results[0].geometry.location.lat(),
	                lng: results[0].geometry.location.lng()
	            };
	            addLocationToDay(day, location);
	            showDay(day);
	        } else {
	            alert('Geocode was not successful for the following reason: ' + status);
	        }
	    });
	}   
	
	function addLocationToDay(day, location) {
	    if (!dayLocations[day]) {
	        dayLocations[day] = [];
	    }
	    dayLocations[day].push(location);
	}
	
	function showDay(day) {
	    clearMarkers();
	    // 예시 데이터
	    const locations = dayLocations[day] || [];
	    locations.forEach((location, index) => {
	        const marker = new google.maps.Marker({
	            position: location,
	            map: body_map,
	            icon:{
	                url: customMarkerImages[index + 1].url,
	                scaledSize: customMarkerImages[index + 1].scaledSize,
	                origin: customMarkerImages[index + 1].origin,
	                anchor: customMarkerImages[index + 1].anchor
	            }
	        });
	        body_markers.push(marker);
	    });
	
	
	    if (body_markers.length > 1) {
	        const lineCoordinates = body_markers.map(marker => marker.getPosition());
	        polyline = new google.maps.Polyline({
	            path: lineCoordinates,
	            geodesic: true,
	            strokeColor: "#1976D2",
	            strokeOpacity: 1.0,
	            strokeWeight: 2,
	        });
	        polyline.setMap(body_map);
	    }
	}
	
	function clearMarkers() {
	    body_markers.forEach(marker => marker.setMap(null));
	    body_markers = [];
	    if (polyline) {
	        polyline.setMap(null);
	        polyline = null;
	    }
	}
});

const timelineService = {
		insert:function(data, callback){
			$.ajax({
				type:"POST",
				url:"/package/timelineRegist",
				data:JSON.stringify(data),
				contentType:"application/json;charset=utf-8",
				success:function(result){
					callback(result)
				},
				error:function(status,xhr){
					 console.error("AJAX Error:", xhr.status, status);
				}
			})
		},
		getContent:function(data, callback){
			$.ajax({
				type:"GET",
				url:"/package/getTimelineContent",
				data:$.param(data),
				contentType:"application/json;charset=utf-8",
				success:function(result){
					callback(result)
				},
				error:function(status,xhr){
					 console.error("AJAX Error:", xhr.status, status);
				}
			})
		},
		get:function(data, callback){
			$.ajax({
				type:"GET",
				url:"/package/timelineList",
				data:$.param(data),
				contentType:"application/json;charset=utf-8",
				success:function(result){
					callback(result)
				},
				error:function(status,xhr){
					 console.error("AJAX Error:", xhr.status, status);
				}
			})
		},
		updateContents:function(data, callback){
			$.ajax({
				type:"PUT",
				url:"/package/timelineContentsUpdate",
				data:JSON.stringify(data),
				contentType:"application/json;charset=utf-8",
				success:function(result){
					callback(result)
				},
				error:function(status,xhr){
					 console.error("AJAX Error:", xhr.status, status);
				}
			})
		},
		delete:function(data, callback){
			$.ajax({
				type:"POST",
				url:"/package/timelineDelete",
				data:JSON.stringify(data),
				contentType:"application/json;charset=utf-8",
				success:function(result){
					callback(result)
				},
				error:function(status,xhr){
					 console.error("AJAX Error:", xhr.status, status);
				}
			})
		},
		deleteAll:function(data,callback){
			$.ajax({
				type:"POST",
				url:"/package/timelineDeleteAll",
				data:JSON.stringify(data),
				contentType:"application/json;charset=utf-8",
				success:function(result){
					callback(result)
				},
				error:function(status,xhr){
					 console.error("AJAX Error:", xhr.status, status);
				}
			})
		}
	}
function uploadSummernoteImageFile(file, editor) {
    let data = new FormData();
	data.append("file", file);
	$.ajax({
		data : data,
		type : "POST",
		url : "/package/SummerNoteImageFile",
		contentType : false,
		processData : false,
		success : function(result){
			$(editor).summernote("insertImage",result);
		},
		error: function(){
			console.log("파일 올리기 오류");
		}
	});
}

function deleteSummernoteImageFile(imageName) {
    data = new FormData()
    data.append('file', imageName)
    $.ajax({
        data: data,
        type: 'POST',
        url: '/package/deleteSummernoteImageFile',
        contentType: false,
        enctype: 'multipart/form-data',
        processData: false,
    })
}
