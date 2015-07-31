   server.method( 'processMessage', function ( parsedEventJson ) {

            return new Promise( function ( resolve, reject ) {

                // copy the event into a new variable
                // since we'll be messing with it and want to return the original
                // as part of the http response
                var eventJson = _.cloneDeep(parsedEventJson);

                // insert event logging here later
                Promise
                .map( eventJson.recipient, function ( recipientId ) {
                    // search for group names and expand them to the member ids
                    return internals.GroupFind( { groupid: recipientId } );
                })
                .reduce( function ( finalRecipientList, resultArray ) {
                    // collect all the group member ids
                    if ( resultArray.length > 0 ) {
                        _.remove(eventJson.recipient, function ( id ) {
                            // remove the groupid from the recipient list
                            return (id === resultArray[0].groupId);
                        });
                        // and replace the groupid with the group's members' ids
                        return _.union(finalRecipientList, resultArray[0].memberIds);
                    }
                    return _.union(finalRecipientList, []);
                }, [])
                .then( function (finalGroupRecipientList) {
                    // merge and deduplicate recipient list after expanding groups
                    return _.union(eventJson.recipient, finalGroupRecipientList);
                })
                .map( function (userid) {
                    // for each userid, search for the user to send the alert to
                    // emails will be sent in parallel
                    return internals.UserFind( { userid: userid } )
                    .then( function ( userObject ) {
                        // once the user is found, email the user
                        if (userObject.length === 0) {
                            server.log(['mailer', 'error'], { error: 'unknown user id', userid: userid, message: parsedEventJson });
                        } else {
                            // assemble and deliver the email message in the background
                            internals.deliverMessage( eventJson, userObject[0] );
                        }
                        return Promise.resolve(userObject);
                    })
                    .error( function (e) {

                        return Promise.reject(e);
                    });
                })
                /*.map( function ( userObject ) {
                    // assemble and deliver the email message in the background
                    internals.deliverMessage( eventJson, userObject[0] );
                    return Promise.resolve(userObject);
                })
                .then( function (userObject) {
                    // this dosn't execute if there were any failures (except for email delivery) along the way
                    // returns a 200 along with the original alert in JSON
                    resolve(parsedEventJson);
                })*/
                .timeout(10000, 'Timeout reached! (10000ms)')
                .catch( Promise.TimeoutError, function (e) {
                    // if a timeout error occurs, return a 400 error with the problem
                    reject(Boom.clientTimeout(e));
                })
                .error( function (e) {
                    // if an isOperational error was found, return a 417 error with the problem
                    reject(Boom.expectationFailed(e));
                })
                .catch( function (e) {
                    // if a different error was found, return a 400 error with the problem
                    reject(Boom.badRequest(e));
                })
                .done( function (resultArray) {
                    // return original alert as parsed json
                    return resolve(parsedEventJson);
         server.method( 'processMessage', function ( parsedEventJson ) {

            return new Promise( function ( resolve, reject ) {

                // copy the event into a new variable
                // since we'll be messing with it and want to return the original
                // as part of the http response
                var eventJson = _.cloneDeep(parsedEventJson);

                // insert event logging here later
                Promise
                .map( eventJson.recipient, function ( recipientId ) {
                    // search for group names and expand them to the member ids
                    return internals.GroupFind( { groupid: recipientId } );
                })
                .reduce( function ( finalRecipientList, resultArray ) {
                    // collect all the group member ids
                    if ( resultArray.length > 0 ) {
                        _.remove(eventJson.recipient, function ( id ) {
                            // remove the groupid from the recipient list
                            return (id === resultArray[0].groupId);
                        });
                        // and replace the groupid with the group's members' ids
                        return _.union(finalRecipientList, resultArray[0].memberIds);
                    }
                    return _.union(finalRecipientList, []);
                }, [])
                .then( function (finalGroupRecipientList) {
                    // merge and deduplicate recipient list after expanding groups
                    return _.union(eventJson.recipient, finalGroupRecipientList);
                })
                .map( function (userid) {
                    // for each userid, search for the user to send the alert to
                    // emails will be sent in parallel
                    return internals.UserFind( { userid: userid } )
                    .then( function ( userObject ) {
                        // once the user is found, email the user
                        if (userObject.length === 0) {
                            server.log(['mailer', 'error'], { error: 'unknown user id', userid: userid, message: parsedEventJson });
                        } else {
                            // assemble and deliver the email message in the background
                            internals.deliverMessage( eventJson, userObject[0] );
                        }
                        return Promise.resolve(userObject);
                    })
                    .error( function (e) {

                        return Promise.reject(e);
                    });
                })
                /*.map( function ( userObject ) {
                    // assemble and deliver the email message in the background
                    internals.deliverMessage( eventJson, userObject[0] );
                    return Promise.resolve(userObject);
                })
                .then( function (userObject) {
                    // this dosn't execute if there were any failures (except for email delivery) along the way
                    // returns a 200 along with the original alert in JSON
                    resolve(parsedEventJson);
                })*/
                .timeout(10000, 'Timeout reached! (10000ms)')
                .catch( Promise.TimeoutError, function (e) {
                    // if a timeout error occurs, return a 400 error with the problem
                    reject(Boom.clientTimeout(e));
                })
                .error( function (e) {
                    // if an isOperational error was found, return a 417 error with the problem
                    reject(Boom.expectationFailed(e));
                })
                .catch( function (e) {
                    // if a different error was found, return a 400 error with the problem
                    reject(Boom.badRequest(e));
                })
                .done( function (resultArray) {
                    // return original alert as parsed json
                    return resolve(parsedEventJson);
                })