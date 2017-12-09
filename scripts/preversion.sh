#!/usr/bin/env sh
if git status --porcelain | grep .; then
    echo ""
    echo ""
    echo "###########################################################"
    echo "###########################################################"	
    echo Attention! Repo is dirty! Please push local repo version :€
    echo "###########################################################"
    echo "###########################################################"	
    echo ""
    echo ""
   
    exit 1		
else
    echo Repo is clean
    npm run build	
fi

