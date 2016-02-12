    /**
        clear timer
    */
    function clearTimer(timer) {
        if (timer != null) {
            clearTimeout(timer);
            timer = null;
        }
    }

    function setMouseoverItem(member) {
        if (mouseoverItem != member) {
            $(mouseoverItem).removeClass("mouseover_item");
        }
        mouseoverItem = member;
        $(mouseoverItem).addClass("mouseover_item");
    }

    /**
        1. remove mouseover highlight
        2. show active highlight
        3. show detail info
    */
    function setActiveItem(member) {
        if (activeItem === member) {
            // the member already active
            return;
        }
        // 1. remove hightlight
        $(mouseoverItem).removeClass("mouseover_item");
        if (activeItem != member) {
            $(activeItem).removeClass("active_item");
        }

        // 2. set active
        mouseoverItem = member;
        activeItem = member;
        $(activeItem).addClass("active_item");

        // 3. shoe detail info
        //console.log("show detail:" + $(activeItem).attr('id'));
        showMemberInfo($(activeItem).attr('id'));
    }

    function showMemberInfo(memberId) {
        var member = findMemberById(memberId);
        if (member == null) {
            console.log('did not find member: ' + memberId);
            return;
        }
        var title = member.name;
        if (title == null) {
            title = member.role;
        }
        $('#member_title').html(title);

        //$('#member_description').html(member.description);
        if (member.description == null) {
            $('#member_description').html('');
        } else {
            /*
            // using folder
            $.get('descriptions/' + member.description)
            .done(function(data) {
                $('#member_description').html(data);
            })
            .fail(function() {
                $('#member_description').html(member.description);
            })
            */
            $('#member_description').html(member.description);
        }
        var photo = '';
        if (member.photo_file != null && member.photo_file != '') {
            //photo = 'api?photo=' + member.photo_file;
            photo = 'http://www.shinshinfoundation.org/pucha_photos/' + member.photo_file;
        }
        $('#member_photo').attr('src', photo);
    }

    // setup jquery-ui tabs
    function setupMenuAndPanels() {
        $("#tabs").tabs({
            event: 'click',
            activate: function(event, ui) {
                setMemberInfoSize();
                setDefaultItem();
            }
        });
        setDefaultItem();
      
        // when 'member' get clicked, show detail info
        $("a.member").click(function(){
            clearTimer(timerDelayActive);
            setMouseoverItem($(this));
            setActiveItem($(this));
        });

        // when 'member' get mouseover, delay sometime, then show detail
        $("a.member").mouseover(function(){
            clearTimer(timerDelayActive);
            setMouseoverItem($(this));
            timer = setTimeout("setActiveItem(mouseoverItem)", 500);
        });
    }

    function setPanelSize() {
        var windowHeight = $(window).innerHeight();
        var panelTop = $('#tab_panel').offset().top;
        var panelHeight = windowHeight - panelTop - 20;
        // tab_panel height fit to window height
        $('#tab_panel').height(panelHeight);
        // limit member box height
        $('#members').height(panelHeight - 10);
        setMemberInfoSize();
    }

    function setMemberInfoSize() {
        var windowHeight = $(window).innerHeight();
        var windowWidth = $(window).innerWidth();
        var width = windowWidth - $('#members').width() - 20;
        var height = $('#members').height();
        $('#member_info_container').css({
            top: $('#tab_panel').offset().top + 50,
            left: $('#members').width() + 40,
            width: width - 80,
            height: height - 100
        });
        $('#member_info').css({
            width: width - 108,
            height: height - 128
        });
    }

    function setDefaultItem() {
        var activeTabIdx = $('#tabs').tabs('option','active');
        var member = $('#' + items[activeTabIdx].category + '0');
        setActiveItem(member);
    }
