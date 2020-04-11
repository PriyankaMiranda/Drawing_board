font_size_adjuster('header', 'inner-box')


function font_size_adjuster(outer, inner) {

    var outer_element = document.getElementById(outer);
    alert(outer_element.offsetHeight)
    var inner_element = document.getElementById(inner);
    alert(inner_element.offsetHeight)


    elements = get_inner_elem_children(inner_element)

    padding = get_outer_elem_padding(outer_element);

    //-------------total spacing = outer padding + height--------------------
    spacing = outer_element.offsetHeight + padding;
    //-------------------------------------------------------------------------

    while (inner_element.offsetHeight + padding > outer_element.offsetHeight) {

        for (index = 0; index < elements.length; ++index) {
            var style = window.getComputedStyle(elements[index], null).getPropertyValue('font-size');
            var fontSize = parseFloat(style);
            elements[index].style.fontSize = (fontSize - 10) + 'px';
        }
    }
}


//----------------get content inside the inner element---------------------
function get_inner_elem_children(element) {
    //this code is used to get all the child elements within an element. 
    //Then it finds the ones with text based on the naming conventionn I follow. 
    //text as a string is included in the id if the elements with text content.
    var children = element.childNodes;
    var elements = [];
    for (var i = 0; i < element.childNodes.length; i++) {
        var child = element.childNodes[i];
        if (child.nodeType == 1 && child.id.includes('text')) {
            elements.push(child)
        }
    }
    return elements;
}
//-------------------------------------------------------------------------

//------------------get outer element padding-----------------------------
function get_outer_elem_padding(element) {
    var style = window.getComputedStyle(element, null).getPropertyValue('padding-top');
    var padding = parseFloat(style);
    console.log(padding)
    return padding
}
//-------------------------------------------------------------------------