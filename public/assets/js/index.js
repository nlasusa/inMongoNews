function displayArticles() {
    
    // Spinner
    $("#article-well").html('<div id="spinner" class="d-flex justify-content-center"><div class="spinner-border text-primary" role="status"><span class="sr-only">Loading...</span></div></div>');

    $.get("/articles").then(function(articles) {
       
        $("#article-well").empty();
        let articlesRendered = 0;
        articles.forEach(article => {
            
            // Only render article if it hasn't been saved in favorites
            if (!article.isSaved) {

                articlesRendered = articlesRendered + 1;

                var parentDiv = $("<div>").addClass("card");
        
                var cardHeaderDiv = $("<div>").addClass("card-header");
                parentDiv.append(cardHeaderDiv);
                
                var h4 = $("<h4>");
                cardHeaderDiv.append(h4);
        
                var a = $("<a>").addClass("article-link").attr("target", "_blank");
                a.attr("href", article.link).attr("data-id", article._id).text(article.title);
                h4.append(a);
        
                var button = $("<button>").addClass("btn btn-success save").text("SAVE");
                h4.append(button);
        
                $("#article-well").append(parentDiv);
                
                console.log(article);
            }
        });

        if (articlesRendered === 0) {
            var parentDiv = $("<div>")

            var h3 = $("<h3>").css("text-align", "center");
            parentDiv.append(h3);

            $("#article-well").append(parentDiv);
        };

      });
};

$(document).ready(function() {

    // On each page load, retrieve all articles in database
    displayArticles();

    // Scrape new articles, and alert user if no new ones are found
    $("#scraper").on("click", function() {
    
        $("#scraper").html('<button class="btn btn-primary" type="button" disabled><span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>checking for new articles..</button>');

        $.get("/scrape").then(function(data) {
            console.log(data);
            displayArticles();
            $("#scraper").html('<button class="btn btn-primary">scrape articles</button>').removeClass('disabled');
        });

    });

    $(document.body).on("click", ".save", function() {
        
        var id = $(this).prev().attr("data-id");

        $.ajax("/articles/" + id, {
            type: "PUT",
            data: {
                isSaved: true
            }
        }).then(function () {
            displayArticles();
        });

    });

});