function toggleFollow(event){
    const followModal = document.querySelector('#user-follow-popup');
    let followerTab = document.getElementById('follower-tab');
    let followingTab = document.getElementById('following-tab');
    const followerTabContent = document.getElementById('followerTabContent');
    const followingTabContent = document.getElementById('followingTabContent');
    let flag = event.target.getAttribute("data-flag");
    let followerList = (shared_data.follower_data['follower']);
    let followingList = (shared_data.following_data['following']);
    let profile_user = shared_data.user;
    if (flag === 'follower')
    {
        seedContent(followerList,followerTabContent, flag);
        activeTabContent(followerTabContent);
        followerTab.classList.add('active');
        followingTab.classList.remove('active');
        followingTab.addEventListener('click', function(){
                activateTab(followingTab);
                activeTabContent(followingTabContent);
                flag = 'following';
                seedContent(followingList,followingTabContent, flag);
            }
        );
        followerTab.addEventListener('click', function()
        {
            activateTab(followerTab);
            activeTabContent(followerTabContent);
            flag = 'follower';
        });
    }
    else if (flag === 'following')
    {
        seedContent(followingList,followingTabContent, flag);
        activeTabContent(followingTabContent);
        followingTab.classList.add('active');
        followerTab.classList.remove('active');
        followerTab.addEventListener('click', function(){
                activateTab(followerTab);
                activeTabContent(followerTabContent);
                flag = 'follower';
                seedContent(followerList,followerTabContent, flag);
            }
        );
        followingTab.addEventListener('click', function()
        {
            activateTab(followingTab);
            activeTabContent(followingTabContent);
            flag = 'following';
        });
    }
    function activeTabContent(tabContent)
    {
        followerTabContent.classList.remove('active');
        followingTabContent.classList.remove('active');
        tabContent.classList.add('active');
    }
    function activateTab(tab) {
        followerTab.classList.remove('active');
        followingTab.classList.remove('active');
        tab.classList.add('active');
    }
    function seedContent(list, tabContent, flag)
    {
        if (list.length === 0){
            const empty_list_container = document.createElement("div");
            empty_list_container.className = "empty-list-container";
                const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                svg.setAttribute("width", "100");
                svg.setAttribute("height", "100");
                svg.setAttribute("viewBox", "0 0 72 72");
                    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                    path.setAttribute("d", "M 49.5 19.5 a 13.5 13.5 0 1 0 -27 0 a 13.5 13.5 0 0 0 27 0 Z m -3 0 a 10.5 10.5 0 1 1 -21 0 a 10.5 10.5 0 0 1 21 0 Z M 36 39 c -10.84 0 -17.31 4.06 -21.02 9.24 c -3.41 4.76 -4.36 10.3 -4.47 14.01 c -0.01 0.41 0.32 0.75 0.74 0.75 h 1.5 c 0.41 0 0.75 -0.33 0.76 -0.75 c 0.11 -3.34 0.98 -8.18 3.9 -12.26 C 20.52 45.68 26.03 42 36 42 c 9.96 0 15.55 3.78 18.68 8.16 A 21.67 21.67 0 0 1 58.5 62.2 c 0 0.41 0.32 0.76 0.73 0.78 l 1.5 0.06 c 0.42 0.02 0.77 -0.3 0.77 -0.72 c 0 -3.58 -0.97 -9.1 -4.4 -13.9 C 53.38 43.2 46.84 39 36 39 Z");
                    path.setAttribute("fill", "currentColor");
                svg.appendChild(path);
                const title = document.createElement("div")
                title.className = "title";
            if (flag === 'follower'){
                title.innerText = "Đã Follow"
            }
            if (flag === 'following'){
                title.innerText = "Được theo dõi"
            }
            const description = document.createElement("div");
            description.className = "description";
            if (flag === 'follower'){
                description.innerText = "Khi người dùng này bắt đầu được follow bởi người khác, bạn sẽ nhìn thấy họ ở đây"
            }
            if (flag === 'following'){
                description.innerText = "Khi người dùng này bắt đầu follow người khác, bạn sẽ nhìn thấy họ ở đây"
            }
            empty_list_container.appendChild(svg);
            empty_list_container.appendChild(title);
            empty_list_container.appendChild(description);
            tabContent.appendChild(empty_list_container);
        }
        else{
            tabContent.innerHTML = '';
            const list_container = document.createElement("div");
            list_container.className = "list-container";
            list.forEach(user => {
                const list_item = document.createElement("li");
                const item_element = document.createElement("div");
                item_element.className = "user-container";

                const user_item = document.createElement("div");
                user_item.className = "user-item";

                const styled_user_info_link = document.createElement("a");
                styled_user_info_link.className = "user-info-link";
                styled_user_info_link.href = '/user/profile/home/' + user['id'];
                const span_avatar_container = document.createElement("span");
                span_avatar_container.className = "span-avatar-container";
                span_avatar_container.style = ` width:48px; height:48px;`;

                const img_avatar = document.createElement("img");
                img_avatar.className = "img-avatar";
                img_avatar.src = user['avatar_url'];
                span_avatar_container.appendChild(img_avatar);
                styled_user_info_link.appendChild(span_avatar_container);

                const user_info = document.createElement("div");
                user_info.className = "user-info";
                const nickname_container = document.createElement("div");
                nickname_container.className = "name-container";
                const name = document.createElement("span");
                name.className = "name";
                name.innerText = user['name'];
                nickname_container.appendChild(name);
                const username = document.createElement("p");
                username.className = "username";
                username.innerText = user['username'];
                user_info.appendChild(nickname_container);
                user_info.appendChild(username);
                styled_user_info_link.appendChild(user_info);

                const button_container = document.createElement("div");
                button_container.className = "button-container";
                const button_wrapper = document.createElement("div");
                button_wrapper.className = "button-wrapper";
                const button = document.createElement("button");
                button.className = "styled-button";
                button.style = `line-height: 24px;`
                if (flag === 'follower')
                    button.innerText = 'Follow';
                else if (flag === 'following')
                    button.innerText = 'Unfollow';
                button_wrapper.appendChild(button);
                button_container.appendChild(button_wrapper);

                user_item.appendChild(styled_user_info_link);
                user_item.appendChild(button_container);
                item_element.appendChild(user_item);
                list_item.appendChild(item_element)
                list_container.appendChild(list_item);
                tabContent.appendChild(list_container);
            });
        }
    }
}


