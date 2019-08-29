/////////////////////////////////////////////////////////////////////////////// 
// Load all models from their respective schemas.
//
// Simplified Web ID Provider Microservice
// Copyright (c) 2018 Ted Byrd
// All Rights Reserved.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.
//
/////////////////////////////////////////////////////////////////////////////// 

'use strict';

//////////////////////////////////////////////////////////////////////////////// 
// Modules
//////////////////////////////////////////////////////////////////////////////// 

const mongoose = require('mongoose');
const path = require('path');

//////////////////////////////////////////////////////////////////////////////// 
// Models
//////////////////////////////////////////////////////////////////////////////// 

const Profile = mongoose.model('Profile', require(path.join(__dirname,'profile')));

///////////////////////////////////////////////////////////////////////////////
// Module Exports
///////////////////////////////////////////////////////////////////////////////

module.exports = {
  Profile
};

///////////////////////////////////////////////////////////////////////////////
// End of File
///////////////////////////////////////////////////////////////////////////////
