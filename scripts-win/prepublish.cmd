@ECHO OFF
if git status --porcelain | findstr -i .
    echo ""
    echo ""
    echo "###########################################################"
    echo "###########################################################"  
    echo Attention! Local Repo is dirty! Please push local repo version :€
    echo "###########################################################"
    echo "###########################################################"  
    echo ""
    echo ""

    exit 1
else
    echo Repo is clean
    npm run build

