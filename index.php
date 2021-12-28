<?php
$token = '***REMOVED***'; # Adam Nunez's TEST TOKEN for redcap.surgery.wisc.edu PID 418 BCWC R01
$fields = ['demo_gender','demo_race','demo_ethnicity'];

$data = [
    'token' => $token,
    'content' => 'record',
    'action' => 'export',
    'format' => 'json',
    'type' => 'flat',
    'csvDelimiter' => '',
    'fields' => $fields,
    'rawOrLabel' => 'raw',
    'rawOrLabelHeaders' => 'raw',
    'exportCheckboxLabel' => 'false',
    'exportSurveyFields' => 'false',
    'exportDataAccessGroups' => 'false',
    'returnFormat' => 'json'
];
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://redcap.surgery.wisc.edu/redcap/api/');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_VERBOSE, 0);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_AUTOREFERER, true);
curl_setopt($ch, CURLOPT_MAXREDIRS, 10);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
curl_setopt($ch, CURLOPT_FRESH_CONNECT, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data, '', '&'));
$response = curl_exec($ch);
curl_close($ch);

?>

<html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
        <meta name="viewport" content="width=device-width, initial-scale=1">        
        <meta http-equiv="content-type" content="text/html; charset=UTF-8">
        <title>BCWC Dashboard</title>
        
        <!--CDNs-->
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
        <script src="https://code.jquery.com/jquery-3.4.1.min.js"></script>
        <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>
        
        <!--Locals-->
        <link rel="stylesheet" href="style.css" media="all">
        <script src="site.js"></script>
    </head>
    <body>
        <div id="wrapper">
            <div class="overlay"></div>
        
            <!-- Sidebar -->
            <nav class="navbar navbar-inverse navbar-fixed-top" id="sidebar-wrapper" role="navigation">
                <ul class="nav sidebar-nav">
                    <li class="sidebar-brand">
                        <a href="#">
                           Bootstrap 3
                        </a>
                    </li>
                    <li>
                        <a href="#"><i class="fa fa-fw fa-home"></i> Home</a>
                    </li>
                    <li>
                        <a href="#"><i class="fa fa-fw fa-folder"></i> Page one</a>
                    </li>
                    <li>
                        <a href="#"><i class="fa fa-fw fa-file-o"></i> Second page</a>
                    </li>
                    <li>
                        <a href="#"><i class="fa fa-fw fa-cog"></i> Third page</a>
                    </li>
                    <li class="dropdown">
                      <a href="#" class="dropdown-toggle" data-toggle="dropdown"><i class="fa fa-fw fa-plus"></i> Dropdown <span class="caret"></span></a>
                      <ul class="dropdown-menu" role="menu">
                        <li class="dropdown-header">Dropdown heading</li>
                        <li><a href="#">Action</a></li>
                        <li><a href="#">Another action</a></li>
                        <li><a href="#">Something else here</a></li>
                        <li><a href="#">Separated link</a></li>
                        <li><a href="#">One more separated link</a></li>
                      </ul>
                    </li>
                    <li>
                        <a href="#"><i class="fa fa-fw fa-bank"></i> Page four</a>
                    </li>
                    <li>
                        <a href="#"><i class="fa fa-fw fa-dropbox"></i> Page 5</a>
                    </li>
                    <li>
                        <a href="#"><i class="fa fa-fw fa-twitter"></i> Last page</a>
                    </li>
                </ul>
            </nav>
            <!-- /#sidebar-wrapper -->

            <!-- Page Content -->
            <div id="page-content-wrapper">
              <button type="button" class="hamburger is-closed animated fadeInLeft" data-toggle="offcanvas">
                <span class="hamb-top"></span>
                <span class="hamb-middle"></span>
                <span class="hamb-bottom"></span>
              </button>
                <div class="container">
                    <div class="row">
                        <div class="col-lg-8 col-lg-offset-2">
                            <h1 class="page-header">Awesome Bootstrap 3 Sidebar Navigation</h1>  
                            <p class="lead">Originally authored by <a href="https://bootsnipp.com/maridlcrmn">maridlcrmn</a> on Bootsnipp and then converted to Less and customized further by <a href="https://jay.holtslander.ca/?utm_source=codepen&utm_medium=pen-link" target="_blank">j_holtslander</a> who is building a <a href="https://codepen.io/collection/nJGkWV" target="_new">collection</a> of great Bootstrap 3 navbars.</p>
                            <p>Maecenas sed diam eget risus varius blandit sit amet non magna. Sed posuere consectetur est at lobortis. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Etiam porta sem malesuada magna mollis euismod. Aenean lacinia bibendum nulla sed consectetur. Nulla vitae elit libero, a pharetra augue.</p>
                            <p>Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Cras mattis consectetur purus sit amet fermentum.</p>
                            <p>Donec id elit non mi porta gravida at eget metus. Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Maecenas faucibus mollis interdum. Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit. Aenean lacinia bibendum nulla sed consectetur.</p>
                            <h3>A heading in the mix.</h3>
                            <p>Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Etiam porta sem malesuada magna mollis euismod. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Cras mattis consectetur purus sit amet fermentum. Curabitur blandit tempus porttitor. Praesent commodo cursus magna, vel scelerisque nisl consectetur et.</p>
                            <blockquote>Maecenas sed diam eget risus varius blandit sit amet non magna. Sed posuere consectetur est at lobortis. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Etiam porta sem malesuada magna mollis euismod. Aenean lacinia bibendum nulla sed consectetur. Nulla vitae elit libero, a pharetra augue.</blockquote>
                            <p>Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Cras mattis consectetur purus sit amet fermentum.</p>
                            <p>Donec id elit non mi porta gravida at eget metus. Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Maecenas faucibus mollis interdum. Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit. Aenean lacinia bibendum nulla sed consectetur.</p>
                            <h3>Another heading for typography's sake.</h3>
                            <p>Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Etiam porta sem malesuada magna mollis euismod. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Cras mattis consectetur purus sit amet fermentum. Curabitur blandit tempus porttitor. Praesent commodo cursus magna, vel scelerisque nisl consectetur et.</p>
                            <p>Maecenas sed diam eget risus varius blandit sit amet non magna. Sed posuere consectetur est at lobortis. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Etiam porta sem malesuada magna mollis euismod. Aenean lacinia bibendum nulla sed consectetur. Nulla vitae elit libero, a pharetra augue.</p>
                            <p>Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Cras mattis consectetur purus sit amet fermentum.</p>
                            <p>Donec id elit non mi porta gravida at eget metus. Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Maecenas faucibus mollis interdum. Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit. Aenean lacinia bibendum nulla sed consectetur.</p>
                        </div>
                    </div>
                </div>
            </div>
            <!-- /#page-content-wrapper -->

        </div>
        <!-- /#wrapper -->
        
    </body>
</html>

