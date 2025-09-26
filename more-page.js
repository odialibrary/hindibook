  /*<![CDATA[*/
    var postperpage = 9;    // posts per page
    var numshowpage = 3;    // pager numbers to show
    var upPageWord = '« Prev';
    var downPageWord = 'Next »';
    var urlactivepage = location.href;
    var home_page = "/";

    var nopage = 1, jenis = "page", nomerhal = 1, lblname1 = "", searchQuery = "", totalPages = 0;

    function loophalaman(totalPosts) {
      var html = "";
      if (numshowpage % 2 === 0) numshowpage++;
      var nomerkiri = parseInt(numshowpage / 2, 10);
      var mulai = nomerhal - nomerkiri;
      if (mulai < 1) mulai = 1;
      var maksimal = Math.ceil(totalPosts / postperpage);
      if (maksimal < 1) maksimal = 1;
      var akhir = mulai + numshowpage - 1;
      if (akhir > maksimal) akhir = maksimal;
      totalPages = maksimal;

      if (nomerhal > 1) html += pageLink(nomerhal - 1, upPageWord);
      if (mulai > 1) { html += pageLink(1,"1"); if (mulai > 2) html += " ... "; }

      for (var jj = mulai; jj <= akhir; jj++) {
        if (nomerhal == jj) html += '<span class="showpagePoint">' + jj + '</span>';
        else html += pageLink(jj,jj);
      }

      if (akhir < maksimal - 1) html += " ... ";
      if (akhir < maksimal) html += pageLink(maksimal, maksimal);

      if (nomerhal < maksimal) html += pageLink(nomerhal + 1, downPageWord);

      var pageArea = document.getElementById("blog-pager");
      if(pageArea) pageArea.innerHTML = html;
    }

    function pageLink(pageNo, text) {
      if (jenis == "page") {
        if (pageNo == 1) return '<span class="showpageNum"><a href="'+home_page+'">'+text+'</a></span>';
        return '<span class="showpageNum"><a href="#" onclick="redirectpage('+pageNo+');return false">'+text+'</a></span>';
      } else if (jenis == "label") {
        var encodedLabel = encodeURIComponent(lblname1);
        if (pageNo == 1) return '<span class="showpageNum"><a href="/search/label/'+encodedLabel+'?&max-results='+postperpage+'">'+text+'</a></span>';
        return '<span class="showpageNum"><a href="#" onclick="redirectlabel('+pageNo+');return false">'+text+'</a></span>';
      } else if (jenis == "search") {
        if (pageNo == 1) return '<span class="showpageNum"><a href="/search?q='+encodeURIComponent(searchQuery)+'&max-results='+postperpage+'">'+text+'</a></span>';
        return '<span class="showpageNum"><a href="#" onclick="redirectsearch('+pageNo+');return false">'+text+'</a></span>';
      }
      return "";
    }

    function hitungtotaldata(root) {
      try {
        var totalPosts = parseInt(root.feed.openSearch$totalResults.$t,10);
        loophalaman(totalPosts);
      } catch(e) { console.error("hitungtotaldata error:", e, root);}
    }

    function halamanblogger() {
      var thisUrl = urlactivepage;
      if(thisUrl.indexOf("/search/label/") != -1){
        jenis = "label";
        lblname1 = decodeURIComponent(thisUrl.split("/search/label/")[1].split("?")[0]);
      } else if(thisUrl.indexOf("/search?q=") != -1){
        jenis = "search";
        searchQuery = decodeURIComponent(thisUrl.split("/search?q=")[1].split("&")[0]);
      } else {
        jenis = "page";
      }

      if(urlactivepage.indexOf("#PageNo=") != -1) nomerhal = parseInt(urlactivepage.substring(urlactivepage.indexOf("#PageNo=")+8),10) || 1;
      else nomerhal = 1;
      nopage = nomerhal;

      var feedUrl = home_page + "feeds/posts/summary?max-results=1&alt=json-in-script&callback=hitungtotaldata";
      if(jenis==="label") feedUrl = home_page + "feeds/posts/summary/-/"+encodeURIComponent(lblname1)+"?alt=json-in-script&callback=hitungtotaldata&max-results=1";
      else if(jenis==="search") feedUrl = home_page + "feeds/posts/summary?q="+encodeURIComponent(searchQuery)+"&alt=json-in-script&callback=hitungtotaldata&max-results=1";

      var script = document.createElement("script");
      script.src = feedUrl;
      document.body.appendChild(script);
    }

    function redirectpage(numberpage) {
      nopage = numberpage;
      var startIndex = (numberpage - 1) * postperpage + 1;
      var newInclude = document.createElement("script");
      newInclude.type = "text/javascript";
      newInclude.src = home_page+"feeds/posts/summary?start-index="+startIndex+"&max-results=1&alt=json-in-script&callback=finddatepost";
      document.getElementsByTagName("head")[0].appendChild(newInclude);
    }

    function redirectlabel(numberpage) {
      nopage = numberpage;
      var startIndex = (numberpage - 1) * postperpage + 1;
      var newInclude = document.createElement("script");
      newInclude.type = "text/javascript";
      newInclude.src = home_page+"feeds/posts/summary/-/"+encodeURIComponent(lblname1)+"?start-index="+startIndex+"&max-results=1&alt=json-in-script&callback=finddatepost";
      document.getElementsByTagName("head")[0].appendChild(newInclude);
    }

    function redirectsearch(numberpage) {
      nopage = numberpage;
      var startIndex = (numberpage - 1) * postperpage + 1;
      var newInclude = document.createElement("script");
      newInclude.type = "text/javascript";
      newInclude.src = home_page+"feeds/posts/summary?q="+encodeURIComponent(searchQuery)+"&start-index="+startIndex+"&max-results=1&alt=json-in-script&callback=finddatepost";
      document.getElementsByTagName("head")[0].appendChild(newInclude);
    }

    function finddatepost(root){
      try {
        if(!root.feed.entry.length) return;
        var post = root.feed.entry[0];
        var dt = new Date(post.published.$t);
        dt.setSeconds(dt.getSeconds()+1); // ✅ Add 1 second to include the first post
        var timestamp = encodeURIComponent(dt.toISOString().substring(0,19) + dt.toISOString().substring(23,29));
        var alamat = "";
        if(jenis=="page") alamat="/search?updated-max="+timestamp+"&max-results="+postperpage+"#PageNo="+nopage;
        else if(jenis=="label") alamat="/search/label/"+encodeURIComponent(lblname1)+"?updated-max="+timestamp+"&max-results="+postperpage+"#PageNo="+nopage;
        else if(jenis=="search") alamat="/search?q="+encodeURIComponent(searchQuery)+"&updated-max="+timestamp+"&max-results="+postperpage+"#PageNo="+nopage;
        location.href = alamat;
      } catch(e){console.error("finddatepost error:",e,root);}
    }

    // Run on load
    halamanblogger();
    /*]]>*/
