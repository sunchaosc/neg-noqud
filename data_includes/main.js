// ========================================================
// === IBEX exp. Chao Sun, last update: 03.02.21 (CS) ===
// ========================================================
// Prerequired commands
PennController.ResetPrefix(null);  // setting prefix to zero
PennController.DebugOff()

// source: https://www.pcibex.net/forums/topic/adding-break-trials/
function SepWithN(sep, main, n) {
    this.args = [sep,main];

    this.run = function(arrays) {
        assert(arrays.length == 2, "Wrong number of arguments (or bad argument) to SepWithN");
        assert(parseInt(n) > 0, "N must be a positive number");
        let sep = arrays[0];
        let main = arrays[1];

        if (main.length <= 1)
            return main
        else {
            let newArray = [];
            while (main.length){
                for (let i = 0; i < n && main.length>0; i++)
                    newArray.push(main.shift());
                for (let j = 0; j < sep.length && main.length>0; ++j)
                    newArray.push(sep[j]);
            }
            return newArray;
        }
    }
}
function sepWithN(sep, main, n) { return new SepWithN(sep, main, n); }
//
//
//
//
Sequence("counter", "hello", "consent", "demographics", "explain", "prac", "start", sepWithN( "break" , randomize("trial") , 22 ) , "send" , "final" );
SetCounter("counter", "inc", 1);
//
//
//
// =========== The Experiment ================
// I. A PennController Sequence to organize the order of Presentation
//PennController.Sequence("hello", sepWithN( "break" , randomize("trial") , 1 ) , "send" , "final" )
// "hello",  "preloadTrial","consent", "demographics", "explain",
//
//
//
//
// II. The Controller(s)
// 1. Welcomming Participant and asking for ID
    PennController("hello"
        ,

        // Create HTML element from Form uploaded to "chunk_includes" section
        newHtml("hi", "hello.html")
            .center()
            .print()
            .log()
        ,

        // get HTML element, which includes printing it
        getHtml("hi")
        ,

        // collect participant ID using a 'text input field'
        newTextInput("ID")
            .center()
            .length(24)
            .before(newText("<p>Please enter your ProlificID here:  <\p>"))
            .log()
            .print()
        ,

        // cheap formating with white space text element, adding two empty lines
        newText("doublebreak", "<br><br>")
            .print()
        ,
        // new Button, will wait until the regex in "getTextInput("ID").test.text(regex)" matches the Input from TextInput "ID" - for now, a 24 long string of "word characters" is necessary
        newButton("continue")
            .center()
            .print()
            .wait(
                getTextInput("ID").test.text(/\w{1}/)
                    .failure(
                        newText("Please enter your Prolific ID!")
                            .color("red")
                            .print()
                            )
            )
            .remove()
        ,

        // declare Input from ID a global variable
        newVar("ID") //
            .global()
            .set(getTextInput("ID"))
    )
    .log( "ID" , getVar("ID")) // ensuring to collect ID
    .setOption("countsForProgressBar", false) // this section will not be counted in the progress bar
    .setOption("hideProgressBar", true) // progress bar hidden during this controller.
    .noHeader()
    ;
//
//
//
//
// 2. Information and Consent
    PennController("consent",
        newHtml("consent", "consent.html")
            .center()
            .print()
            .log()
        ,
        // cheap formating with white space text element, adding two empty lines
        newText("doublebreak", "<br><br>")
            .print()
        ,
        newButton("agree", "I consent (continue)")
//            .log()
//            .print("center at 50%", "middle at 75%" )
//            .wait()
     ,
       newButton("disagree", "I do NOT consent (leave)")
//            .print("center at 50%", "middle at 25%" )
//            .wait()
        ,
       newCanvas("form", 600, 200)
            .settings.center()
            .settings.add(   50, 100, getButton("disagree") )
            .settings.add(   400, 100, getButton("agree") )
            .print()
        ,
        newSelector()

            .settings.add( getButton("agree") , getButton("disagree") )
            .settings.log()
            .wait()
            .test.selected( getButton("disagree"))
            .success( newText("Please close this tab to exit the experiment.")
                        .center()
                        .print()
                        .wait())

//            .failure( newText("Incorrect!")
//                     .center()
//                     .print())

//       getButton(disagree).test.selected("Yes")
//            .success( SendResults() )

    )
    .log("ID", getVar("ID"))
    .setOption("countsForProgressBar", false)
    .setOption("hideProgressBar", true)
    .noHeader()
    ;
//
//
//
//
// 3. Collecting demographic data

    PennController("demographics"
        ,
        newHtml("demographics", "demographics.html")
//          .checkboxWarning("Bitte setze ein Häckchen bei '%name%', um fortzufahren!")
//            .inputWarning("Bitte trage etwas in das Feld '%name%' ein, um fortzufahren!")
//            .radioWarning("Bitte setze deine Auswahl im Feld '%name%', um fortzufahren!")
            .center()
            .print()
            .log()
        ,
        // cheap formating with white space text element, adding two empty lines
        newText("doublebreak", "<br><br>")
            .print()
        ,
        newButton("continue", "continue")
            .center()
            .print()
            .wait(
                getHtml("demographics").test.complete()
                    .failure( getHtml("demographics").warn() )
                )
    )
    .log("ID", getVar("ID"))  // ensuring to collect ID
    .setOption("countsForProgressBar", false)
    .setOption("hideProgressBar", true)
    .noHeader()
    ;
//
//
//
//
// 5. Procedure explained
    PennController("explain"
        ,
        newHtml("howto", "howto.html")
            .center()
            .print()
            .log()
        ,
        getHtml("howto")
        ,
        // cheap formating with white space text element, adding two empty lines
        newText("doublebreak", "<br><br>")
            .print()
        ,
        newButton("start")
            .log()
            .center()
            .print()
            .wait()
    )
    .log("ID", getVar("ID"))  // ensuring to collect ID
    .setOption("countsForProgressBar", false)
    .setOption("hideProgressBar", true);
//
//
//
// 6. Practice
//
PennController.Template(PennController.GetTable("practice.csv"),
    variable =>
    PennController("prac"
        ,
        newTimer("wait1", 250)
            .start()
            .wait()
        ,
        newImage("one", variable.Link)
            .settings.size(560, 280)
//                .print()
        ,
        newText("sentence", variable.Sentence)
            .settings.css("font-size", "2em")
//                .print()
        ,
        newButton("1T", "True")         // a button with the word 'start'; DP
//                .print()
        ,
        newButton("0F", "False") // a button with the word 'start'; DP
//                .print()
        ,
        newCanvas("task", 1200, 350)
            .settings.center()
            .settings.add(   50, 100, getText("sentence") )
            .settings.add(   550, 0, getImage("one") )
            .settings.add(   450, 330, getButton("1T") )
            .settings.add(   650, 330, getButton("0F") )
            .print()
        ,
        newSelector()

            .settings.add( getButton("1T") , getButton("0F") )
            .settings.keys(          "ArrowLeft"  ,           "ArrowRight")
            .settings.log()
            .wait()
            .test.selected( getButton(variable.CA ))
            .success( newText("Correct!")
                     .center()
                     .print())
            .failure( newText("Incorrect!")
                     .center()
                     .print())
        ,
        newTimer(1000).start().wait()

        )

        .log("ItemID", variable.Item)
        .log("List", variable.List)
        .log("Condition", variable.Condition)
        .log( "ID" , getVar("ID"))

        );
//
//
//
//
    PennController("start"
        ,
        newText("endprac", "Great! Let's get started for real now.")
            .settings.css("font-size", "2em")
            .center()
            .print()
        ,
        newText("key", "Press any key to continue.")
            .settings.css("font-size", "2em")
            .center()
            .print()
        ,

        newKey("any", "")
            .wait()
    );
//
// 7. Trial events
    PennController.Template( PennController.GetTable("item.csv"),   // creates a template to be used for multiple trials; will use .csv in chunk_includes
        variable =>
        PennController("trial"
            ,
            newTimer("wait1", 250)
                .start()
                .wait()
            ,
            newImage("one", variable.Link)
                .settings.size(560, 280)
//                .print()
            ,
            newText("sentence", variable.Sentence)
                .settings.css("font-size", "2em")
//                .print()
            ,
            newButton("true", "True")         // a button with the word 'start'; DP
//                .print()
            ,
            newButton("false", "False") // a button with the word 'start'; DP
//                .print()
            ,
            newCanvas("task", 1200, 350)
                .settings.center()
                .settings.add(   50, 100, getText("sentence") )
                .settings.add(   550, 0, getImage("one") )
                .settings.add(   450, 330, getButton("true") )
                .settings.add(   650, 330, getButton("false") )
                .print()
            ,
            newSelector()

                .settings.add( getButton("true") , getButton("false") )
                .settings.keys(          "ArrowLeft"  ,           "ArrowRight")
                .settings.log()
                .wait()

    )

    .log("Item", variable.Item)
    .log("List", variable.List)
    .log("Condition", variable.Condition)
    .log( "ID" , getVar("ID")) // ensures that for each trial, logging value of ID in variable ID; this should be OUTSIDE of PennController()
    );
//
//8. Break
    PennController("break"
        ,
        newText("next", "Let's take a break. Press any key to continue when you are ready.")
            .settings.css("font-size", "2em")
            .center()
            .print()
        ,
        newKey("any", "")
            .wait()
    )
//
//
// 9. Send results
    PennController.SendResults( "send" ); // important!!! Sends all results to the server
//
//
//
//
// 10. Thank you screen
PennController( "final" ,
                newText("<p>Thank you for your participation!</p>")
                .print()
                ,
                newText("<p><a href='https://app.prolific.co/submissions/complete?cc=658AB7CA'>Please click this link to confirm your participation</a></p>") // confirmation link (e.g., for payment)
                .print()
                ,
                newButton("void") // this creates a 'void' button that must be clicked to continue. This is because we don't want them to be able to continue beyond this screen
                .wait() // so basically this is the end and there's no way to go any further
               );
