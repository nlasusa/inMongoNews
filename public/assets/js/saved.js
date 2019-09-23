function displaySavedArticles() {
    $("#article-well").html('<div id="spinner" class="d-flex justify-content-center"><div class="spinner-border text-primary" role="status"><span class="sr-only">Loading...</span></div></div>');

    $.get("/articles").then(function (articles) {

        $("#article-well").empty();
        let articlesRendered = 0;
        articles.forEach(article => {

            // Only render article if it HAS been saved in favorites
            if (article.isSaved) {

                articlesRendered = articlesRendered + 1;
                
                var parentDiv = $("<div>").addClass("card");

                var cardHeaderDiv = $("<div>").addClass("card-header");
                parentDiv.append(cardHeaderDiv);

                var h4 = $("<h4>");
                cardHeaderDiv.append(h4);

                var a = $("<a>").addClass("article-link").attr("target", "_blank");
                a.attr("href", article.link).attr("data-id", article._id).text(article.title);
                h4.append(a);

                var button = $("<button>").addClass("btn btn-danger delete").text("DELETE");
                h4.append(button);

                var button2 = $("<button>").addClass("btn btn-primary view-note").text("NOTES");
                h4.append(button2);

                $("#article-well").append(parentDiv);

                console.log(article);
            };
        });

        if (articlesRendered === 0) {
            var parentDiv = $("<div>")

            var h3 = $("<h3>").css("text-align", "center");
            parentDiv.append(h3);

            $("#article-well").append(parentDiv);
        };
    });
};

function displayNotes(articleID) {
    $.get("/articles/" + articleID).then(function (data) {
        // Without the if clause, newly saved articles throw an undefined error
        if (data.note) {
            console.log(data.note.noteText);
            $("#retrieved-note").text(data.note.noteText);
        };
    });
};

$(document).ready(function () {

    // On each page load, retrieve all articles in database
    displaySavedArticles();

    // Event delegation for deleting article from database
    $(document.body).on("click", ".delete", function () {
        var id = $(this).prev().attr("data-id");
        $.ajax("/articles/" + id, {
            type: "DELETE",
        }).then(function () {
            displaySavedArticles();
        });
    });

    // Event delegation to open notes modal
    $(document.body).on("click", ".view-note", function () {
        var id = $(this).prev().prev().attr("data-id");

        $.get("/articles/" + id).then(function (data) {
            console.log(data);
            let noteText;
            if (data.note) {
                noteText = data.note.noteText;
            } else {
                noteText = "";
            }
            // Constructing HTML to add to the notes modal
            var modalText = $("<div class='container-fluid text-center'>").append(
                $("<h4>").text("Notes For Article: " + id).attr("article-id", id).addClass("modalID"),
                $("<p id='retrieved-note'>").text(noteText),
                $("<hr>"),
                $("<ul class='list-group note-container'>"),
                $("<textarea id='new-note' placeholder='New Note' rows='4' cols='60'>"),
                $("<button class='btn btn-success save'>Save Note</button>")
            );
          
            // Adding the formatted HTML to the note modal
            bootbox.dialog({
                message: modalText,
                closeButton: true
            });
        });
    });

    // Event delegation to post new notes
    $(document.body).on("click", ".save", function () {

        var articleID = $(".modalID").attr("article-id");
        var noteText = $("#new-note").val();
        $.ajax("/articles/" + articleID, {
            type: "POST",
            data: {
                noteText: noteText
            }
        }).then(function (data) {
            console.log(data._id);
            if (data.note) {
                displayNotes(data._id)
            };
        });
    });
});