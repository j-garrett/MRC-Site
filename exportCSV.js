/*source: http://jsfiddle.net/terryyounghk/kpegu/

Also Tried:

<input type="button" id="btnExport" value=" Export Table data into Excel " />
<script>
http://jsfiddle.net/jWAJ7/2047/
$("#btnExport").click(function (e) {
    window.open('data:application/vnd.ms-excel,' + $('#dvData').html());
    e.preventDefault();
});
</script>

*/


$(document).ready(function () {

    function exportTableToCSV($table, filename) {

        var $rows = $table.find('tr:has(td)'),

            // Temporary delimiter characters unlikely to be typed by keyboard
            // This is to avoid accidentally splitting the actual contents
            tmpColDelim = String.fromCharCode(11), // vertical tab character
            tmpRowDelim = String.fromCharCode(0), // null character

            // actual delimiter characters for CSV format
            colDelim = '","',
            rowDelim = '"\r\n"',

            // Grab text from table into CSV formatted string
            csv = '"' + $rows.map(function (i, row) {
                var $row = $(row),
                    $cols = $row.find('td');

                return $cols.map(function (j, col) {
                    var $col = $(col),
                        text = $col.text();

                    return text.replace(/"/g, '""'); // escape double quotes

                }).get().join(tmpColDelim);

            }).get().join(tmpRowDelim)
                .split(tmpRowDelim).join(rowDelim)
                .split(tmpColDelim).join(colDelim) + '"',

            // Data URI
            csvData = 'data:application/csv;charset=utf-8,' + encodeURIComponent(csv);

        $(this)
            .attr({
            'download': filename,
                'href': csvData,
                'target': '_blank'
        });
    }

    // This must be a hyperlink
    $(".export").on('click', function (event) {
      //grab url to create filename
      var fileName = window.location.pathname.replace("/03_jQuery-Test/","").replace(".html",".csv");

      // CSV
      //finds element with id of dvData and uses it's immediate child table.
      exportTableToCSV.apply(this, [$('#dvData>table'), fileName]);

      // IF CSV, don't do event.preventDefault() or return false
      // We actually need this to be a typical hyperlink
    });
});